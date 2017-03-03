"use strict"
angular.module('app').factory('EmergencyFund', [
  'Constants',
  'Utilities',
  EmergencyFund
  ]);

function EmergencyFund(
  Constants,
  Utilities
  ) {
  var service = {
    blocks : middleManager(),
  };

  return service;

  ///////////////

  function middleManager() {
    Constants.tableConfig.temp.emergencyFund = {};

    var tally = {
      annualEscalationPct: 0.000,
      guid               : Utilities.guid(),
      type               : 'tally',
      classes            : [],
      initialPayment     : {
        amount: 0,
        date  : new Date('01/01/2017'),
      },
    };

    var section = {
      name    : 'emergency fund',
      title   : 'emergency fund',
      type    : 'section',
      parents : [{}],
      children: _getChildren(),
      guid    : Utilities.guid(),
      tally   : tally,
    };
    Constants.tableConfig.temp.emergencyFund.tallyGuid = section.guid;

    return section;
  }

  function _getChildren() {
    var inflowFromHousehold = {
      type    : 'lineItem',
      title   : 'inflow from household',
      name    : 'inflowFromHousehold',
      guid    : Utilities.guid(),
      seedData: {
        seedDataType: 'dependent',
      }
    };
    Constants.tableConfig.temp.emergencyFund.inflowFromHouseholdGuid = inflowFromHousehold.guid;

    var outflowToHousehold = {
      type    : 'lineItem',
      title   : 'outflow to household',
      name    : 'outflowToHousehold',
      guid    : Utilities.guid(),
      seedData: {
        seedDataType: 'dependent',
      }
    };

    return [
      inflowFromHousehold,
      // outflowToHousehold,
    ];
  }

}
