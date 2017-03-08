"use strict"
angular.module('app').factory('Constants', [ 'Utilities', Constants_]);

function Constants_(Utilities) {
  var tableConfig = {
    numColInTable       : 3,
    startDate           : '01/01/2017',
    endDate             : null,
    dates               : [],
    timeIntervalDays    : 30,
    monthTransitionCells: [],
    yearTransitionCells : [],
    temp                : {}, // For storing guids.
  };

  var service = {
    getLineItemBaseParams,
    getPaymentBaseParams ,
    refreshTableConfig,
    tableConfig: tableConfig,
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
    var tableConfig = service.tableConfig;
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
