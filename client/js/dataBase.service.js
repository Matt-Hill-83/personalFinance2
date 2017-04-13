"use strict"
angular.module('app').factory('DataBase',
  [
    'Api',
    '$q',
    'DataGeneration',
    'Constants',
    'Utilities',
    DataBase_
  ]);

var logBlocks   = true;
var logBlocks   = false;

var logPayments = true;
var logPayments = false;

var logRules    = true;
var logRules    = false;

function DataBase_(
  Api,
  $q,
  DataGeneration,
  Constants,
  Utilities
  ) {
  var service = {
    extendBaseParams,
    cloneScenario,
    deleteScenario,
    rebuildLocalDataBase,
    removeBlocksFromDbForScenario,
    blockDb  : [],
    paymentDb: [], 
    lineItems: lineItems(),
    payments : payments(),
  };

  var rulesFunctions = {
    moveUntilFull,
  };

  var clonedBlockGuidMap;
  var tallyRecalcUnderway;

  return service;

  ////////////////////////////////////////////////////// Local DataBase Operations //////////////////////////////////
  
  function removeBlocksFromDbForScenario(scenarioGuid) {
    var scenarioExistsInBlockDb = service.blockDb.some(block=> block.scenario === scenarioGuid);

    if (scenarioExistsInBlockDb) {
      var cleanedDb = service.blockDb.filter(block=> block.scenario !== scenarioGuid);
      service.blockDb.splice(0, service.blockDb.length, ...cleanedDb);
    }
  }

  function rebuildLocalDataBase(scenarioGuid){
    removeBlocksFromDbForScenario(scenarioGuid);

    var scenarioExistsInPaymentDb = service.paymentDb.some(payment=> payment.scenario === scenarioGuid);

    if (scenarioExistsInPaymentDb) {
      var cleanedDb = service.paymentDb.filter(payment=> payment.scenario !== scenarioGuid);
      service.paymentDb.splice(0, service.paymentDb.length, ...cleanedDb);
    }
    
    service.blockDb.push(...Constants.scenarios[scenarioGuid].newBlocks);

    // move this to preprocesser.
    var topSection = Constants.scenarios[scenarioGuid].newBlocks.filter(block=> block.parentGuid === -1)[0];
    topSection.nestLevel = 0;
    Constants.scenarios[scenarioGuid].topSection = topSection;

    addParents(topSection);
    addPaymentsToDb(topSection);

    // Recursively add all children to top level topSection.
    Constants.tableConfig.dates.forEach((date, index)=> {
      addTotalsToDb(topSection, date);
      addTalliesToDb(topSection, date);
    
      var rules = Constants.rules.filter(rule=>rule.scenario === scenarioGuid);
      
      rules.forEach(rule=> {
        var dataBaseSubset = service.blockDb.filter((block)=> block.scenario === scenarioGuid);
        
        if (rule.function) {
          var ruleMadeChanges = rulesFunctions[rule.function](rule, date);

          // Get the chain of parents for the line item that was changed.
          // Only these blocks will need to have their totals and tallys recreated.
          if (ruleMadeChanges) {
            var blockIdsNeedingTallyRecalc = [];

            var outflowBlock = service.lineItems.getSectionByGuid(rule.outflowLineItemGuid, dataBaseSubset);
            var inflowBlock  = service.lineItems.getSectionByGuid(rule.inflowLineItemGuid, dataBaseSubset);
            blockIdsNeedingTallyRecalc.push(...outflowBlock.parents.map(parent=> parent.guid));
            blockIdsNeedingTallyRecalc.push(...inflowBlock.parents.map(parent=> parent.guid));

            var blocksNeedingTallyRecalc = [];
            blockIdsNeedingTallyRecalc.forEach(guid=> {
              // Don't include top block.  It contains no data, and is just a container.
              if (guid === topSection.guid) {
                return;
              }  
              
              blocksNeedingTallyRecalc.push(service.lineItems.getSectionByGuid(guid, dataBaseSubset));
            });

            blocksNeedingTallyRecalc.forEach(block=> block.recalculateTally = true);
            tallyRecalcUnderway = true;
            
            addTotalsToDb(topSection, date);
            addTalliesToDb(topSection, date);
    
            blocksNeedingTallyRecalc.forEach(block=> block.recalculateTally = false);
            tallyRecalcUnderway = false;
          }
          // Throw in a final total and tally in case the outermost section is a sum of tallys.
          // A better way to do this would be to step upward from the bottom recursively after each rule and total and tally
          // according to what the blocks require.  Brain pretzel. TODO
          addTotalsToDb(topSection, date);
        }

      });
    });

    if (logBlocks) {
      console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
      console.log('service.blockDb: ');
      console.table(service.blockDb);
      console.log('|------------------------------------------------------------------------------------------------|')
    }

    if (logPayments) {
      console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
      console.log('service.paymentDb: ');
      console.table(service.paymentDb);
      console.log('|------------------------------------------------------------------------------------------------|')
    }
    
    if (logRules) {
      console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
      console.log('Constants.rules: ');
      console.table(Constants.rules);
      console.log('|------------------------------------------------------------------------------------------------|')
    }
  }

  function queryLocalDb(params, db) {
    return db.filter(payment=> {
      for (var param in params) {
        if (!params[param]) {
          return 'bad paramater was passed';
        }

        // Date objects cannot be compared with ===.
        // If the param is a date, use a different comparison.
        // Figure out if it is a date by checking to see if the getTime
        // method exists.
        if (params[param].getTime) {
          var paramTrue = Utilities.areDatesEqual(payment[param], params[param]);
        } else {
          var paramTrue = payment[param] === params[param];
        }

        if (!paramTrue) {
          // Stop looking and eturn false if any parameter is not found.
          return false;
        }
      }
      // If all params were found, return true.
      return true;
    });    
  }

  function addParents(section) {
    // TODO: move this to model where it will be permanent:
    section.showOnChart = false;
    var children = service.lineItems.getFirstChildrenOf(section);
    children.map(child=> {
      child.showOnChart = false;
      _addParentToLineage(child, section)      
      if (child.type === 'section') {
        addParents(child);
      }

    });
  }

  function addPaymentsToDb(section) {
    var children = service.lineItems.getFirstChildrenOf(section);
    children.map(child=> {
      if (child.type === 'lineItem' && child.seedData) {
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
        service.payments.createTotal(child, date);          
      }
    });
  }

  function addTalliesToDb(section, date) {
    var children = service.lineItems.getFirstChildrenOf(section);
    children.map(child=> {
      if (child.type === 'section') {
        // Create most deeply nested tallies first.
        addTalliesToDb(child, date);
        if (child.tally) {
          service.payments.createTallyPayment(child, date);
        }
      }
    });
  }

  function _addParentToLineage(child, parent) {
    child.parentGuid  = parent.guid;
    child.nestLevel   = parent.nestLevel + 1;
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

  ////////////////////////////////////////////////////// Clone Scenario //////////////////////////////////

  function deleteScenario(scenarioGuid) {
    return Api.deleteScenario(scenarioGuid)
    .then(resp=> {
      removeBlocksFromDbForScenario(scenarioGuid);
    });
  }

  function getNewGuidFromOldGuid(oldGuid, clonedBlockGuidMap){
    var result = clonedBlockGuidMap.filter(item=> item.oldGuid === oldGuid);
    if (result[0]) {
      return result[0].newGuid;
    } else {
      return 'error';
    }
  }

  // TODO: This function could be run twice and both instances could modify the same array. Fix this.
  function cloneScenario(scenarioGuid, studyGuid) {
    clonedBlockGuidMap = [];
    var params = {
      parentGuid: -1,
      scenario  : scenarioGuid,
    };

    var topBlock = service.lineItems.getByParams(params)[0];
    return Api.createScenario(studyGuid)
    .then((resp)=> {
      var newScenarioGuid = resp.data.id;
      return cloneBlocks(newScenarioGuid, topBlock)
      .then(()=> {
        var rules = Constants.rules.filter(rule=>rule.scenario === scenarioGuid);
        var promises = rules.forEach(rule=> {
          rule.scenario            = newScenarioGuid;
          rule.sourceGuid          = getNewGuidFromOldGuid(rule.sourceGuid, clonedBlockGuidMap);
          rule.outflowLineItemGuid = getNewGuidFromOldGuid(rule.outflowLineItemGuid, clonedBlockGuidMap);
          rule.destinationGuid     = getNewGuidFromOldGuid(rule.destinationGuid, clonedBlockGuidMap);
          rule.inflowLineItemGuid  = getNewGuidFromOldGuid(rule.inflowLineItemGuid, clonedBlockGuidMap);

          return Api.addRule(rule);
        });
        return $q.all(promises);
      });
    });
  }

  function cloneBlocks(newScenarioGuid, block, parentGuid=-1) {
    var newGuidMapRecord = {oldGuid: block.guid};
    return Api.createRow(convertBlockToRequest(newScenarioGuid, block, parentGuid))
    .then((resp)=> {
      var newGuid = resp.data.id;
      newGuidMapRecord.newGuid = parseInt(newGuid);
      clonedBlockGuidMap.push(newGuidMapRecord);
      var children = service.lineItems.getFirstChildrenOf(block);
      var promises = children.map(child=> {
        return cloneBlocks(newScenarioGuid, child, newGuid);
      });

      return $q.all(promises);
    });
  }

  function convertBlockToRequest(newScenarioGuid, block, parentGuid) {
    var newBlock = angular.copy(block);

    if (newBlock.parentGuid === -1) {
      newBlock.parentGuid = -1
    } else {
      newBlock.parentGuid = parentGuid;
    }

    newBlock.name     = newBlock.name;
    newBlock.scenario = newScenarioGuid;
    return newBlock;
  }

  ////////////////////////////////////////////////////// Rules //////////////////////////////////

  function moveUntilFull(rule, date) {
    var pettyCashTarget = rule.destinationMaxAmount;
    var outflowLineItem = service.lineItems.getByParams({guid: rule.outflowLineItemGuid})[0];
    var inflowLineItem  = service.lineItems.getByParams({guid: rule.inflowLineItemGuid})[0];

    var sourcePayment      = service.payments.getTotalGrossPaymentByDateAndGuid(date, rule.sourceGuid);
    var destinationPayment = service.payments.getByParams(
      {
        date      : date,
        type      : 'tally',
        parentGuid: rule.destinationGuid,
      }
    )[0];

    if (
      outflowLineItem &&
      inflowLineItem &&
      pettyCashTarget &&
      sourcePayment &&
      destinationPayment &&
      sourcePayment.amount > rule.sourceMinAmount &&
      destinationPayment.amount < pettyCashTarget
      ) {
      var pettyCashShortfall = pettyCashTarget - destinationPayment.amount;

      // Don't transfer more than you have.
      var sourceAmountAvailable = sourcePayment.amount - rule.sourceMinAmount;
      var amountToTransfer      = pettyCashShortfall > sourceAmountAvailable ? sourceAmountAvailable : pettyCashShortfall;

      var paymentToSend = {
        date  : date,
        type  : outflowLineItem.type,
        amount: -amountToTransfer,
        name  : outflowLineItem.name,
      };
  
      paymentToSend.valueToDisplay = paymentToSend.amount;
      service.payments.create(paymentToSend, outflowLineItem);

      var paymentToReceive = {
        date  : date,
        type  : inflowLineItem.type,
        amount: amountToTransfer,
        name  : inflowLineItem.name,
      };
  
      paymentToReceive.valueToDisplay = paymentToReceive.amount;
      service.payments.create(paymentToReceive, inflowLineItem);
      return true;
    } else {
      return false;
    }
  }

  ////////////////////////////////////////

  function lineItems() {
    return {
      create,
      getSectionByGuid,
      getSections,
      getSiblings,
      getBlockFromGuid,
      getByParams,
      getChildBlocksFromSection,
      getInterestRowForTally,
      getFirstChildrenOf,
    };

    function create(record, parent) {
      if (parent) {
        _addParentToLineage(record, parent);
      }

      extendBaseParams(Constants.getLineItemBaseParams(), record);
      service.blockDb.push(record);
      return record;
    }

    function getSectionByGuid(guid, dataBase) {
      var result = dataBase.filter(block=> block.guid === guid);

      if (result.length === 1) {
        return result[0];
      } else if (result.length === 0) {
        return 'no blocks found';
      } else if (result.length > 1) {
        return 'more than 1 blocks found';
      }
    }

    function getInterestRowForTally(tallyGuid) {
      var result = service.blockDb.filter(block=> {
        return (
          block.parentGuid === tallyGuid &&
          block.subtype1 === 'interest'
        );
      });

      if (result.length === 1) {
        return result[0];
      } else if (result.length === 0) {
        return 'no blocks found';
      } else if (result.length > 1) {
        return 'more than 1 blocks found';
      }
    }

    function getBlockFromGuid(blockGuid) {
      var params = {
        guid: blockGuid,
      };
      var result = getByParams(params);

      if (result.length === 1) {
        return result[0];
      } else if (result.length === 0) {
        return 'no blocks found';
      } else if (result.length > 1) {
        return 'more than 1 blocks found';
      }
    }
    
    function getSections() {
      return getByParams({type: 'section'});
    }

    function getSiblings(block) {
      var params = {
        guid: block.parentGuid
      };

      var parent   = service.lineItems.getByParams(params)[0];
      var siblings = service.lineItems.getFirstChildrenOf(parent);
      return siblings;
    }

    function getByParams(params, db) {
      if (!db) {
        db = service.blockDb;
      }

      var children = queryLocalDb(params, db);
      return Utilities.sortSections(children);
    }

    function getChildBlocksFromSection(section) {
      var children = service.blockDb.filter(block=> isChildBlockInSection(block, section));
      return Utilities.sortSections(children);
    }

    function getFirstChildrenOf(parent) {
      var children = service.blockDb.filter(child=> child.parentGuid === parent.guid);
      return Utilities.sortSections(children);
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
      createTotal,
      createSumPayments,      
      createTallyPayment,
      getByParams,
      getPaymentByDate,
      getTotalGrossPaymentByDateAndGuid,
      getPaymentsByDates,
    };

    function create(record, parent) {
      if (parent) {
        _addParentToLineage(record, parent);
      }

      extendBaseParams(Constants.getPaymentBaseParams(), record);

      // TODO: base params are not being extended correctly.  
      // record.classes = ['cell'];
      record.scenario       = parent.scenario;
      record.classes        = Constants.getPaymentBaseParams().classes;
      record.valueToDisplay = record.amount;

      service.paymentDb.push(record);
    }

    function getByParams(params, db) {
      if (!db) {
        db = service.paymentDb;
      }
      return queryLocalDb(params, db);
    }

    function getTotalGrossPaymentByDateAndGuid(date, parentGuid) {
      var params = {
        date      : date,
        parentGuid: parentGuid,
        type      : 'total gross',
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

    function createTotal(section, date) {
      if (tallyRecalcUnderway && !section.recalculateTally) {
        return;
      }

      var newPayment = {
        date  : date,
        type  : 'total gross',
        amount: 0,
        name  : section.name,
      };

      // Get children of item to be totalled.
      var firstChildren = service.lineItems.getFirstChildrenOf(section).filter(child=> {
        return (
          child.type === 'lineItem' ||
          child.type === 'section'
        );
      });

      firstChildren.forEach(child=> {
        // If the parent is a 'total of tallies', only sum payments of children that are tally payments.
        if (section.subtype1 === 'total of tallies'){
          var params = {
            date      : date,
            parentGuid: child.guid,
            type      : 'tally',
          };
        } else {
          // If parent is any other type of block, only include certain child payments in total.
          // Don't include interest payments in the section totals.  They have not been calculated yet and 
          // will be calculated separately when the tally payments are created.
          if (child.subtype1 === 'interest') {
            return;
          }
            
          // If the child is a tally, only grab the 'tally' type payments.
          // Tally sections also have 'total gross' payments, which are there for calculating the tally payments.
          if (child.tally) {
            var params = {
              date      : date,
              parentGuid: child.guid,
              type      : 'tally',
            };

          } else {
            // //////////////////////// TODO: fix this, it is probably grabbing tally payments too.
            // This only matters when you have a total section above a tally section.
            var params = {
              date      : date,
              parentGuid: child.guid,
            };
        }

        }
          var payment       = service.payments.getByParams(params)[0];
          var paymentAmount = payment ? payment.amount : 0;
          newPayment.amount += paymentAmount;
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

    function createTallyPayment(section, tableDate) {
      if (tallyRecalcUnderway && !section.recalculateTally) {
        return;
      }

      var paymentDate;
      var yesterdayAmount;
      var dailyEscalationPct;

      // unit test this math.
      var annualEscalationPct = section.tally.annualEscalationPct ? section.tally.annualEscalationPct : 0;
      if (annualEscalationPct !== 0) {
        dailyEscalationPct = Math.pow(
          // (1 + annualEscalationPct*100),(1/365)
          (1 + annualEscalationPct/100),(1/365)
          ) - 1;
      } else {
        dailyEscalationPct = 0;
      }

      // For the first calculation, if tally has a non-zero start amount,
      // start tally from tally initial payment date.
      if (Utilities.areDatesEqual(tableDate, Constants.tableConfig.dates[0])) {
        console.log('dates are equal');
        
        if (section.tally.tallyPayment && section.tally.tallyPayment.amount > 0) {
            paymentDate     = section.tally.tallyPayment.date;
            yesterdayAmount = section.tally.tallyPayment.amount;
        } else {
          paymentDate     = Constants.tableConfig.dates[0];
          yesterdayAmount = 0;
        }

      } else {
        var previousPaymentDate = Utilities.addDays(tableDate, -Constants.tableConfig.timeIntervalDays);
        paymentDate             = Utilities.addDays(previousPaymentDate, 1);

        var params = {
          date      : previousPaymentDate,
          parentGuid: section.guid,
          type      : 'tally',
        };
debugger;
        var yesterdayTally = service.payments.getByParams(params)[0];
        yesterdayAmount    = yesterdayTally.amount;
      }

      // Grab a slice of the db, so you don't need to look through the entire db every iteration.
      var dbSliceParams = {
        parentGuid: section.guid,
        type      : 'total gross',
      };

      var dbSlice = service.payments.getByParams(dbSliceParams);

      var todayTotalParams = {
        date: paymentDate,
      };

      var todayTotal;
      var todayTotalAmount;
      var interestOnTally;
      var interestAccumulatedSinceLastTallyRecord = 0;
      var todayTallyAmount;

      while (paymentDate <= tableDate) {
        todayTotalParams.date = paymentDate;

        // Get previously created section total payment.
        todayTotal       = service.payments.getByParams(todayTotalParams, dbSlice)[0];
        todayTotalAmount = todayTotal ? todayTotal.amount : 0;
        interestOnTally  = (yesterdayAmount *  dailyEscalationPct);
        interestAccumulatedSinceLastTallyRecord += interestOnTally;

        // TODO: make interest its own line item.
        // todayTallyAmount = yesterdayAmount + todayTotalAmount;
        todayTallyAmount = yesterdayAmount + interestOnTally + todayTotalAmount;

        var interestBlock = service.lineItems.getInterestRowForTally(section.guid);

        if (Utilities.areDatesEqual(paymentDate, tableDate)) {
          var newInterestPayment = {
            amount: interestAccumulatedSinceLastTallyRecord,
            date  : paymentDate,
            type  : 'interest on tally',
            name  : interestBlock.name,
          };

          var newPayment = {
            amount: todayTallyAmount,
            date  : paymentDate,
            type  : 'tally',
            name  : section.name,
          };

          // TODO: If the previous one was null, and the new one is 0, don't update
          service.payments.createOrUpdate(newInterestPayment, interestBlock);
          service.payments.createOrUpdate(newPayment, section);
          interestAccumulatedSinceLastTallyRecord = 0;
          break;
        }

        paymentDate     = Utilities.addDays(paymentDate, 1);
        yesterdayAmount = todayTallyAmount;
      }
    }

  }

}




































