"use strict"
angular.module('app').factory('Cash2Db',
  [
    '$http',
    'Constants',
    'EmergencyFund',
    'Four01kDb',
    'HomeDownPayment',
    'PettyCashDb',
    'StockDb',
    'Utilities',
    CashDb 
  ]);

function CashDb(
  $http,
  Constants,
  EmergencyFund,
  Four01kDb,
  HomeDownPayment,
  PettyCashDb,
  StockDb,
  Utilities
  ){
  var mattJobStart = '05/01/2017';

  var service = {
    blocks : getAllBlocks,
  };

  console.log('cashDb');

  return service;

  ///////////////

  function getAllBlocks() {
    var topLevel = {
      name    : 'topLevel',
      title   : 'top level',
      type    : 'section',
      parents : [{}],
      // children: tables(),
      children: _getInflows(),
      // children: getCashBlocks(),
      guid    : Utilities.guid(),
    };

    return [topLevel];
  }

  function tables() {
    var net = {
      name    : 'cash net',
      title   : 'cash net',
      type    : 'section',
      parents : [{}],
      children: getNet(),
      guid    : Utilities.guid(),
    };
    Constants.tableConfig.temp.cashNetGuid = net.guid;

    return [
      net,
    ];
  }

  function getNet() {
    var cash = {
      name    : 'cashSection',
      title   : 'cash gross',
      type    : 'section',
      children: getCashBlocks(),
      guid    : Utilities.guid(),
    };

    return [
      cash,
    ];
  }

  function getCashBlocks() {
    var inflows = {
      name    : 'inflows',
      title   : 'inflows',
      type    : 'section',
      children: _getInflows(),
      guid    : Utilities.guid(),
    };

    var outflows = {
      title   : 'outflows',
      name    : 'outflows',
      negate  : true,
      type    : 'section',
      guid    : Utilities.guid(),
      children: _getOutflows(),
    };

    return [
      inflows,
      outflows,
    ];
  }

  function _getInflows(){
    var mattPaycheck = {
      type    : 'lineItem',
      title   : 'matt paycheck',
      name    : 'mattPaycheck',
      guid    : Utilities.guid(),
      seedData: {
        seedDataType: 'periodicDates',
        initialPayment     : {
          date        : '01/01/2017',
          amount      : 3000,
        },
        numDaysInInterval: 15,
      }
    };

    var penPaycheck = {
      type    : 'lineItem',
      title   : 'pen  paycheck',
      name    : 'penPaycheck',
      guid    : Utilities.guid(),
      seedData: {
        seedDataType: 'periodicDates',
        initialPayment     : {
          date        : null,
          amount      : 3000,
        },
        numDaysInInterval: 15,
      }
    };

    return [
      mattPaycheck,
      penPaycheck,
    ];
  }

  function _getOutflows(){
    var groceries = {
      title   : 'groceries',
      name    : 'groceries',
      type    : 'lineItem',
      guid    : Utilities.guid(),
      seedData: {
        seedDataType: 'periodicDates',
        initialPayment     : {
          date        : null,
          amount      : 200,
        },
        numDaysInInterval: 7,
      }
    };
    
    var rent = {
      title   : 'rent',
      name    : 'rent',
      type    : 'lineItem',
      guid    : Utilities.guid(),
      seedData: {
        seedDataType: 'periodicDates',
        initialPayment     : {
          date        : null,
          amount      : 2000,
        },
        numDaysInInterval: 30,
      }
    };
    
    return [
      rent,
    ];
  }

}
