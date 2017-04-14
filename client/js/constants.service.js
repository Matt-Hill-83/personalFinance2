"use strict"
angular.module('app').factory('Constants', [ 'Utilities', Constants_]);

function Constants_(Utilities) {
  var tableConfig = {
    // numColInTable       : 4,
    numColInTable       : 16,
    startDate           : '01/01/2017',
    endDate             : null,
    dates               : [],
    timeIntervalDays    : 90,
    // timeIntervalDays    : 2,
    monthTransitionCells: [],
    yearTransitionCells : [],
  };

  // var comparators = [
  //   {
  //     index: 0,
  //     text :'is less than',
  //   },
  //   {
  //     index: 1,
  //     text :'is equal to',
  //   },
  //   {
  //     index: 2,
  //     text :'is greater than',
  //   },
  // ];

  // var conjunctions = [
  //   {
  //     index: 0,
  //     text :'AND',
  //   },
  //   {
  //     index: 1,
  //     text :'OR',
  //   },
  // ];

  // // obsolete
  // var myRules = [
  //   {
  //     name           : 'from household to reserve',
  //     sourceGuid     : 645,
  //     destinationGuid: 640,
  //     conditions: [
  //       {
  //         blockGuid  : 624,
  //         value      : 0,
  //         comparator : comparators[2],
  //         conjunction: conjunctions[0],
  //       },
  //       {
  //         blockGuid  : 625,
  //         value      : 10000,
  //         comparator : comparators[0],
  //         conjunction: null,
  //       },
  
  //     ],
  //   },
  // ];

  var service = {
    getLineItemBaseParams,
    getPaymentBaseParams ,
    refreshTableConfig,
    tableConfig,
    // myRules,
    // comparators,
    // conjunctions,
    tableSettings: {
      tableInterval: 'monthly',
    },
    scenarios  : {},
    charts     : [{}],
    chartData: {
      activeChart: null,
    }
  };

  refreshTableConfig();
  return service;

  /////////////////////////////// public functions /////////////////////

  function getLineItemBaseParams() {
    return {
      classes  : [],
      collapsed: false,
      name     : 'none',
      showRow  : true,
      type     : 'lineItem',
    };
  }

  function getPaymentBaseParams() {
    return {
      classes: ['cell'],
    };
  }

  function refreshTableConfig() {
    angular.extend(service.tableConfig, _getTableConfig());
  }

  /////////////////////////////// private functions /////////////////////

  function _getTableConfig() {
    var tableConfig       = service.tableConfig;
    tableConfig.startDate = new Date(tableConfig.startDate);

    tableConfig.dates = [];
    for (var i = 0; i < tableConfig.numColInTable; i++) {
      var lastDayOfFirstInterval =
        Utilities.addDays(tableConfig.startDate, tableConfig.timeIntervalDays - 1);
      tableConfig.dates.push(Utilities.addDays(lastDayOfFirstInterval, i * tableConfig.timeIntervalDays));
    }

    tableConfig.endDate = Utilities.getLast(tableConfig.dates);

    return tableConfig;
  }

}
