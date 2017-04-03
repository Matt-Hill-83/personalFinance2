"use strict"
angular.module('app').factory('Rules', [ 'Constants', Rules_]);

function Rules_(Constants) {
  // function getRules() {
  //   var homeToPettyCash = {
  //     function: 'moveUntilFull', 
  //     source  : {
  //       guid               : 2,
  //       outflowLineItemGuid: 12,
  //     },
  //     destination: {
  //       guid              : 3,
  //       targetAmount      : 10000,
  //       inflowLineItemGuid: 7,
  //     },
  //   };

  //   var homeToEmergencyFund = {
  //     function: 'moveUntilFull', 
  //     source  : {
  //       guid               : 2,
  //       outflowLineItemGuid: 13,
  //     },
  //     destination: {
  //       guid              : 4,
  //       targetAmount      : 30000,
  //       inflowLineItemGuid: 9,
  //     },
  //   };

  //   var rules = [
  //     homeToPettyCash,
  //     homeToEmergencyFund,
  //   ];

  //   return rules;

  // }

  var service = {
    rules: [],
  };

  return service;

  /////////////////////////////////


}