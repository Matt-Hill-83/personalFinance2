"use strict"
angular.module('app').factory('Rules', [ 'Constants', Rules_]);

function Rules_(Constants) {
  var homeToPettyCash = {
    function: 'moveUntilFull', 
    source  : {
      guid               : Constants.tableConfig.temp.cashNetGuid,
      outflowLineItemGuid: Constants.tableConfig.temp.outflowToPettyCashGuid,
    },
    destination: {
      guid              : Constants.tableConfig.temp.pettyCashTallyGuid,
      targetAmount      : 10000,
      inflowLineItemGuid: Constants.tableConfig.temp.inflowFromHouseholdGuid,
    },
  };

  var homeToEmergencyFund = {
    function: 'moveUntilFull', 
    source  : {
      guid               : Constants.tableConfig.temp.cashNetGuid,
      outflowLineItemGuid: Constants.tableConfig.temp.outflowToEmergencyFundGuid,
    },
    destination: {
      guid              : Constants.tableConfig.temp.emergencyFund.tallyGuid,
      targetAmount      : 30000,
      inflowLineItemGuid: Constants.tableConfig.temp.emergencyFund.inflowFromHouseholdGuid,
    },
  };

  var outflowToHomeDownPayment = {
    function: 'moveUntilFull', 
    source  : {
      guid               : Constants.tableConfig.temp.cashNetGuid,
      outflowLineItemGuid: Constants.tableConfig.temp.outflowToHomeDownPaymentGuid,
    },
    destination: {
      guid              : Constants.tableConfig.temp.homeDownPayment.tallyGuid,
      targetAmount      : 200000,
      inflowLineItemGuid: Constants.tableConfig.temp.homeDownPayment.inflowFromHouseholdGuid,
    },
  };
  
  var rules = [
    homeToPettyCash,
    homeToEmergencyFund,
    outflowToHomeDownPayment,
  ];

  var service = {
    rules,
  };

  return service;

}
