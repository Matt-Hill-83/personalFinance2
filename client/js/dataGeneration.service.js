"use strict"
angular.module('app').factory('DataGeneration', ['Constants', 'Utilities', DataGeneration_]);

function DataGeneration_(Constants, Utilities) {
  var seedConversionFunctions = {
    arbitraryDates: _createPaymentsFromArbitraryDates,
    periodicDates : _createPaymentsFromPeriodicDates,
    calculated    : _createCalculatedPayments,
    dependent     : _returnEmptyArray,
  };

  var service = {
    seedConversionFunctions,
  };

  return service;

  ///////////////

  function _createPaymentsFromArbitraryDates(lineItem, tableConfig) {

    console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
    console.log('lineItem: ');
    console.log(lineItem);
    console.log('|------------------------------------------------------------------------------------------------|')
    
    
    if (!lineItem.seedData) {
      return [];
    }
    
    var payments = lineItem.seedData.payments.map(payment=> {
      var newParams = {
        date          : new Date(payment.date),
        valueToDisplay: payment.amount,
        type          : 'primary',
        name          : lineItem.name,
      };
      angular.extend(payment, newParams);

      return payment;
    });

    payments = _convertPaymentsToCorrectInterval(payments, tableConfig);
    return payments;
  }

  function _createCalculatedPayments(lineItem, tableConfig) {
    return [];
  }

  function _returnEmptyArray(lineItem, tableConfig) {
    return [];
  }

  function _createPaymentsFromPeriodicDates(lineItem, tableConfig) {
    // If no start date is provided, start on the first day of the table.
    var startDate = 
      lineItem.seedData.initialPayment.date ?
      new Date(lineItem.seedData.initialPayment.date) :
      tableConfig.startDate;
    
    var paymentDate   = startDate;
    var paymentAmount = lineItem.seedData.initialPayment.amount;
    var payments      = [];
    
    // Create payment objects.
    var numPaymentsCreated = 0;
    while (paymentDate <= tableConfig.endDate) {
      var test = typeof(lineItem.seedData.numPayments);

      // If the seedData type is based on a specific number of payments, break when that number of payments
      // has been created.
      if (
        lineItem.seedData.numPayments !== -1 &&
        lineItem.seedData.numPayments !== null &&
        numPaymentsCreated >= lineItem.seedData.numPayments
        ) {
        break;
      }

      var payment = {
        amount        : paymentAmount,
        date          : paymentDate,
        name          : lineItem.name,
        type          : 'primary',
        valueToDisplay: paymentAmount,
      };

      
      payments.push(payment);
      paymentDate = Utilities.addDays(paymentDate, lineItem.seedData.numDaysInInterval);
      numPaymentsCreated += 1;
    }

    payments = _convertPaymentsToCorrectInterval(payments, tableConfig);
    return payments;
  }

  function _convertPaymentsToCorrectInterval(payments, tableConfig) {
    // Create a hash where the key is the date, and use the value to tally all the payments for that date.
    var newPayments = {};
    payments.map(payment=> {

      // For each payment create the first search interval at the start of the table.
      var intervalStartDate = tableConfig.startDate;
      var intervalEndDate   = Utilities.addDays(tableConfig.startDate, tableConfig.timeIntervalDays - 1);
      
      // Stop looking for an interval if the payment is not in the table time period.
      while (payment.date <= tableConfig.endDate) {
        // Ignore payments that happen before the chart starts.
        if (payment.date.getTime() < intervalStartDate.getTime()) {
          // break jumps to the next payment and move the search interval back to the first interval.
          // This covers cases where the payments are not ordered chronologicly.
          break;
        }
        
        // Look for an interval where the payment is greater than or equal to the start date, and less than the interval end date.
        var intervalFound = 
          payment.date.getTime() >= intervalStartDate.getTime() &&
          payment.date.getTime() <= intervalEndDate.getTime();

        if (intervalFound) {
          // If the date where the payments will be consolidated exists in the hash, add to it.
          // Otherwise create a new entry in the hash.
          if(newPayments[intervalEndDate.toDateString()]) {
            newPayments[intervalEndDate.toDateString()] += payment.amount;
          } else {
            newPayments[intervalEndDate.toDateString()] = payment.amount;
          }
          // break jumps to the next payment and move the search interval back to the first interval.
          // This covers cases where the payments are not ordered chronologicly.
          break;
        }

        // If the payment was not found in the interval, jump to the next interval.
        // Increment the interval.
        intervalStartDate = Utilities.addDays(intervalStartDate, tableConfig.timeIntervalDays);
        intervalEndDate   = Utilities.addDays(intervalEndDate,   tableConfig.timeIntervalDays);
      }

    return payment;
    });

    // Convert payments hash into an array of payments.
    var output = [];
    for (var payment in newPayments) {
      var temp            = angular.copy(payments[0]);
      temp.amount         = newPayments[payment];
      temp.valueToDisplay = newPayments[payment];
      temp.date           = new Date(payment);
      output.push(temp);
      
    }
    return output;
  }

}
