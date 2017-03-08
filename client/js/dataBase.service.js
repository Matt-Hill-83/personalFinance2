"use strict"
angular.module('app').factory('DataBase',
  [
    'DataGeneration',
    'CashDb',
    'Cash2Db',
    'Constants',
    'Rules',
    'Utilities',
    DataBase_
  ]);

function DataBase_(
  DataGeneration,
  CashDb,
  Cash2Db,
  Constants,
  Rules,
  Utilities
  ) {
  var service = {
    extendBaseParams,
    rebuildLocalDataBase,
    blockDb  : [],
    paymentDb: [], 
    lineItems: lineItems(),
    payments : payments(),
  };

  var rulesFunctions = {
    moveUntilFull,
  }

  return service;

  ///////////////

  function getBlocksFromPostgres() {
    var newData = Constants.newData;
      newData.forEach(block=> {
        block.guid = parseInt(block.id);

        block.parentGuid = parseInt(block.parentGuid);
        block.nestLevel  = parseInt(block.nestLevel);

        if (
          block.type === 'lineItem' &&
          block.seedData &&
          block.seedData.seedDataJoinPayment
          ) {
          block.seedData.initialPayment = block.seedData.seedDataJoinPayment.seedPayment;
          block.seedData.initialPayment.date = new Date(block.seedData.initialPayment.date);
          block.seedData.seedDataJoinPayment = 'removed from object to avoid confusion';
        
          if (block.seedData.numDaysInInterval) {
            block.seedData.numDaysInInterval = parseInt(block.seedData.numDaysInInterval);
          }
        }

      });

    return newData;
  }

  function rebuildLocalDataBase(){
    service.blockDb   = [];
    service.paymentDb = [];

    var newData = getBlocksFromPostgres();
    service.blockDb.push(...newData);
    
    var section = newData.filter(block=> block.guid === 1)[0];
    Constants.tableConfig.topSection = section;

    console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
    console.log('newData: ');
    console.table(newData);
    console.log('|------------------------------------------------------------------------------------------------|')

    addParents(section);
    addPaymentsToDb(section);

    // Recursively add all children to top level section.
    Constants.tableConfig.dates.forEach((date, index)=> {
      addTotalsToDb(section, date);
      addTalliesToDb(section, date);
      
      // Rules.rules().forEach(rule=> {
      //   rulesFunctions[rule.function](rule, date);
      //   addTotalsToDb(section, date);
      //   addTalliesToDb(section, date);
      // });

    });

    console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
    console.log('service.blockDb: ');
    console.table(service.blockDb);
    console.log('|------------------------------------------------------------------------------------------------|')


    console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
    console.log('service.paymentDb: ');
    console.table(service.paymentDb);
    console.log('|------------------------------------------------------------------------------------------------|')
    
  }

  function addParents(section) {
    var children = service.lineItems.getFirstChildrenOf(section);
    children.map(child=> {
      _addParentToLineage(child, section)      
      if (child.type === 'section') {
        addParents(child);
      }

    });
  }

  function addPaymentsToDb(section) {
    var children = service.lineItems.getFirstChildrenOf(section);
    children.map(child=> {
      if (child.type === 'lineItem') {
        // Turn seed data into payments and add them to paymentDb.
          var newPayments =
            DataGeneration.seedConversionFunctions[child.seedData.seedDataType](child, Constants.tableConfig);

          newPayments.forEach(payment=> service.payments.create(payment, child));
      } else if (child.type === 'section') {
        addPaymentsToDb(child);
      }

    });
  }

  function addTotalsToDb(section, date) {
    var children = service.lineItems.getFirstChildrenOf(section);
    children.map(child=> {
      if (child.type === 'section') {
        addTotalsToDb(child, date);
        createTotal(child, date);          
      }
    });
  }

  function addTalliesToDb(section, date) {
    var children = service.lineItems.getFirstChildrenOf(section);
    children.map(child=> {
      if (child.type === 'section') {
        addTalliesToDb(child, date);
        if (child.tally) {
          service.payments.createTallyPayment(child, date);
        }
      }
    });
  }

  function moveUntilFull(inputs, date) {
    var pettyCashTarget    = inputs.destination.targetAmount;
    var sourcePayment      = service.payments.getPaymentByDateAndGuid(date, inputs.source.guid);
    var destinationPayment = service.payments.getByParams(
      {
        date      : date,
        type      : 'tally',
        parentGuid: inputs.destination.guid,
      }
    )[0];

    if (
      sourcePayment &&
      destinationPayment &&
      sourcePayment.amount > 0 &&
      destinationPayment.amount < pettyCashTarget
      ) {
      
      var outflowLineItem = service.lineItems.getByParams({guid: inputs.source.outflowLineItemGuid})[0];
      var inflowLineItem = service.lineItems.getByParams({guid: inputs.destination.inflowLineItemGuid})[0];

      var pettyCashShortfall = pettyCashTarget - destinationPayment.amount;

      // Don't transfer more than you have.
      var amountToTransfer = pettyCashShortfall > sourcePayment.amount ? sourcePayment.amount : pettyCashShortfall;

      var paymentToSend = {
        date          : date,
        type          : outflowLineItem.type,
        amount        : -amountToTransfer,
        name          : outflowLineItem.name,
      };
  
      paymentToSend.valueToDisplay = paymentToSend.amount;
      service.payments.create(paymentToSend, outflowLineItem);


      var paymentToReceive = {
        date          : date,
        type          : inflowLineItem.type,
        amount        : amountToTransfer,
        name          : inflowLineItem.name,
      };
  
      paymentToReceive.valueToDisplay = paymentToReceive.amount;
      service.payments.create(paymentToReceive, inflowLineItem);

    }

  }

  function createTotal(section, date) {
    var newPayment = {
      date          : date,
      type          : 'total gross',
      amount        : 0,
      name          : section.name,
    };

    // Get children of item to be totalled.
    var firstChildren = service.lineItems.getFirstChildrenOf(section).filter(child=> {
      return (
        child.type === 'lineItem' ||
        child.type === 'section'
      );
    });

    firstChildren.forEach(child=> {
        var payment = service.payments.getPaymentByDate(date, child);
        var paymentAmount = payment ? payment.amount : 0;

        if (child.negate) {
          newPayment.amount -= paymentAmount;
        } else {
          newPayment.amount += paymentAmount;
        }
    });

    newPayment.valueToDisplay = newPayment.amount;

    // Create or update record.
    var params = {
      date      : date,
      parentGuid: section.guid,
      type      : 'total gross',
    };

    // Get previously created section total payment.
    var existingPayment = service.payments.getByParams(params)[0];
    if (existingPayment) {
      existingPayment.amount         = newPayment.amount;
      existingPayment.valueToDisplay = newPayment.amount;
    } else {
      service.payments.create(newPayment, section);
    }

  }

  function _addParentToLineage(child, parent) {
    child.parentGuid = parent.guid;
    child.nestLevel  = parent.nestLevel + 1;

    var parentParents = parent.parents ? parent.parents : [];

    child.parents = parentParents.concat([
      {
        guid: parent.guid,
        name: parent.name,
        type: parent.type,
      }
    ]);
    return child;
  }

  function extendBaseParams(baseParams, customizedParams) {
    var baseParamsCopy = angular.copy(baseParams);
    return angular.extend(baseParamsCopy, customizedParams);
  }

  ////////////////////////////////////////

  function lineItems() {
    return {
      create,
      getSections,
      getByParams,
      getChildBlocksFromSection,
      getFirstChildrenOf,
    };

    function getSections() {
      return getByParams({type: 'section'});
    }

    function create(record, parent) {
      if (parent) {
        _addParentToLineage(record, parent);
      }

      extendBaseParams(Constants.getLineItemBaseParams(), record);
      service.blockDb.push(record);
      return record;
    }

    function getByParams(params) {
      return service.blockDb.filter(blocks=> {

        // TODO - this is duplicated, turn it into a function.
        var allParamsTrue = true;
        for (var param in params) {
          // Date objects cannot be compared with ===.
          // If the param is a date, use a different comparison.
          // Figure out if it is a date by checking to see if the getTime
          // method exists.
          if (params[param].getTime) {
            var paramTrue = Utilities.areDatesEqual(blocks[param], params[param]);
          } else {
            var paramTrue = blocks[param] === params[param];
          }

          // This mechanism sets allParams to false, if any param is not true.
          allParamsTrue = allParamsTrue && paramTrue;
        }
        return allParamsTrue;
      });
    }

    function getChildBlocksFromSection(section) {
      return service.blockDb.filter(block=> isChildBlockInSection(block, section));
    }

    function getFirstChildrenOf(parent) {
      return service.blockDb.filter(child=> child.parentGuid === parent.guid);
    }

    function isChildBlockInSection(lineItem, section) {
      if (lineItem.parents) {
        // Get list of all parentsGuids in lineage.
        var parentGuids = lineItem.parents.map(parent=> parent.guid);
          // If the payment has the sectionGuid in its list of ancestors, return it.
        return parentGuids.indexOf(section.guid) !== -1;
      } else {
        return false;
      }
    }
  }

  function payments() {
    return {
      create,
      createOrUpdate,
      createSumPayments,      
      createTallyPayment,
      getByParams,
      getPaymentByDate,
      getPaymentByDateAndGuid,
      getPaymentsByDates,
    };

    function create(record, parent) {
      if (parent) {
        _addParentToLineage(record, parent);
      }

      extendBaseParams(Constants.getPaymentBaseParams(), record);

      // TODO: base params are not being extended correctly.  
      // record.classes = ['cell'];
      record.classes = Constants.getPaymentBaseParams().classes;
      record.valueToDisplay = record.amount;

      service.paymentDb.push(record);
    }

    function getByParams(params) {
      return service.paymentDb.filter(payment=> {
        var allParamsTrue = true;
        for (var param in params) {
          // Date objects cannot be compared with ===.
          // If the param is a date, use a different comparison.
          // Figure out if it is a date by checking to see if the getTime
          // method exists.
          if (params[param].getTime) {
            var paramTrue = Utilities.areDatesEqual(payment[param], params[param]);
          } else {
            var paramTrue = payment[param] === params[param];
          }

          // This mechanism sets allParams to false, if any param is not true.
          allParamsTrue = allParamsTrue && paramTrue;
        }
        return allParamsTrue;
      });
    }

    function getPaymentByDateAndGuid(date, parentGuid) {
      var params = {
        date      : date,
        parentGuid: parentGuid,
      };

      var payments = getByParams(params);

      if (payments.length > 1) {
        return 'too many payments found';
      }

      return payments[0];
    }

    function getPaymentByDate(date, block) {
      var params = {
        date      : date,
        parentGuid: block.guid,
      };

      var payments = getByParams(params);

      if (payments.length > 1) {
        return 'too many payments found';
      }

      return payments[0];
    }

    function getPaymentsByDates(dates, block) {
      return dates.map(date=> {
        return getPaymentByDate(date, block);
      });
    }

    function isPaymentInSection(payment, section, date) {
      // Get list of all parentsGuids in lineage.
      var parentGuids = payment.parents.map(parent=> parent.guid);
      return (
        payment.type === 'primary' &&
        Utilities.areDatesEqual(payment.date, date) &&

        // If the payment has the sectionGuid in its list of ancestors, add the payment's amount to the tally.
        parentGuids.indexOf(section.guid) !== -1
      );
    }

    function createTallyPayment(section, tableDate) {
      var tableConfig = Constants.tableConfig;
      var paymentDate;
      var yesterdayAmount;

      // unit test this math.
      var annualEscalationPct      = section.tally.annualEscalationPct ? section.tally.annualEscalationPct : 0;
      var dailyAnnualEscalationPct = Math.pow(
        (1+annualEscalationPct),(1/365)
        ) - 1;

      // For the first calculation, start tally from tally initial payment date.
      if (Utilities.areDatesEqual(tableDate, tableConfig.dates[0])) {
        paymentDate     = section.tally.initialPayment.date;
        yesterdayAmount = section.tally.initialPayment.amount;
      } else {
        var previousPaymentDate = Utilities.addDays(tableDate, -tableConfig.timeIntervalDays);
        paymentDate             = Utilities.addDays(previousPaymentDate, 1);

        var params = {
          date      : previousPaymentDate,
          parentGuid: section.guid,
          type      : 'tally',
        };

        var yesterdayTally = service.payments.getByParams(params)[0];
        yesterdayAmount    = yesterdayTally.amount;
      }

      while (paymentDate <= tableDate) {
        var params = {
          date      : paymentDate,
          parentGuid: section.guid,
          type      : 'total gross',
        };

        // Get previously created section total payment.
        var todayTotal = service.payments.getByParams(params)[0];

        var todayTotalAmount = todayTotal ? todayTotal.amount : 0;
        var interestOnTally = (yesterdayAmount *  dailyAnnualEscalationPct);

        // TODO: make interest its own line item.
        var todayTallyAmount = yesterdayAmount + interestOnTally + todayTotalAmount;

        if (paymentDate.getTime() === tableDate.getTime()) {
          var newPayment = {
            amount: todayTallyAmount,
            date  : paymentDate,
            type  : 'tally',
            name  : section.name,
          };

          service.payments.createOrUpdate(newPayment, section);
          break;
        }

        paymentDate     = Utilities.addDays(paymentDate, 1);
        yesterdayAmount = todayTallyAmount;
      }
    }

    function createOrUpdate(newPayment, section) {
      var params = {
        date      : newPayment.date,
        parentGuid: section.guid,
        type      : newPayment.type,
      };

      // Get previously created section total payment.
      var existingPayment = service.payments.getByParams(params)[0];
      if (existingPayment) {
        existingPayment.amount = newPayment.amount;
        existingPayment.valueToDisplay = newPayment.amount;
      } else {
        service.payments.create(newPayment, section);
      }
    }

    function createSumPayments(sum, tableConfig) {
      tableConfig.dates.map(date=>{
        var newPayment = {
          date: date,
          type: sum.type,
          name: sum.name,
        };
        
        newPayment.date   = date;
        newPayment.amount = 0;

        // Sum the relevant section totals.
        service.paymentDb.forEach(payment=> {
          if (
              payment.type === 'section' &&
              (sum.sectionsToSum.indexOf(payment.name) !== -1) &&
              Utilities.areDatesEqual(newPayment.date, payment.date)
             ) {
              newPayment.amount += payment.amount;
          };
        });
        newPayment.valueToDisplay = newPayment.amount;
        service.payments.create(newPayment, sum);
      });
    }
  }

}




































