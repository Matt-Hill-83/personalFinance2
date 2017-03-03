"use strict"
angular.module('app').factory('StockDb', ['Utilities', StockDb]);

function StockDb(Utilities) {
  var service = {
    blocks : middleManager(),
  };

  return service;

  ///////////////

  function middleManager() {
    var tally = {
      title              : 'stock cash',
      annualEscalationPct: 0.000,
      name               : 'stockTally',
      guid               : Utilities.guid(),
      type               : 'tally',
      classes            : ['cashTally'],
      initialPayment: {
        amount: 10000,
        date  : new Date('01/01/2017'),
      },
    };

    var section = {
      name    : 'middleManager',
      title   : 'Stock',
      type    : 'section',
      parents : [{}],
      children: getStock(),
      guid    : Utilities.guid(),
      tally   : tally,
    };

    return [section];
  }

  function getStock() {
    var inflows = {
      collapsed: true,
      name     : 'inflows',
      title    : 'Inflows',
      type     : 'section',
      children : _getInflows(),
      guid     : Utilities.guid(),
    };

    var outflows = {
      negate   : true,
      collapsed: true,
      title    : 'Outflows',
      name     : 'outflows',
      negate   : true,
      type     : 'section',
      guid     : Utilities.guid(),
      children : _getOutflows(),
    };

    return [
      inflows,
      outflows,
    ];
  }

  function _getInflows(){
    var stockPurchase = {
      type    : 'lineItem',
      title   : 'stock purchase',
      name    : 'stockPurchase',
      guid    : Utilities.guid(),
      seedData: {
        seedDataType: 'periodicDates',
        payment     : {
          startDate        : null,
          startAmount      : 1000,
          numDaysInInterval: 30,
        }
      }
    };


    return [
      stockPurchase,
    ];
  }

  function _getOutflows(){
    var stockSale = {
      type    : 'lineItem',
      title   : 'stock sale',
      name    : 'stockSale',
      guid    : Utilities.guid(),
      seedData: {
        seedDataType: 'periodicDates',
        payment     : {
          startDate        : null,
          startAmount      : 500,
          numDaysInInterval: 30,
        }
      }
    };

    return [
      stockSale,
    ];
  }

}
