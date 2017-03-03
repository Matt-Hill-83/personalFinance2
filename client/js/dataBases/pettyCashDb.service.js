"use strict"
angular.module('app').factory('PettyCashDb', [
  'Constants',
  'Utilities',
  PettyCashDb
  ]);

function PettyCashDb(
  Constants,
  Utilities
  ) {
  var service = {
    blocks : middleManager(),
  };

  return service;

  ///////////////

  function middleManager() {
    var tally = {
      annualEscalationPct: 0.000,
      guid               : Utilities.guid(),
      type               : 'tally',
      classes            : [],
      initialPayment     : {
        amount: 10,
        date  : new Date('01/01/2017'),
      },
    };

    var section = {
      name    : 'petty cash',
      title   : 'petty cash',
      type    : 'section',
      parents : [{}],
      children: _getPettyCash(),
      guid    : Utilities.guid(),
      tally   : tally,
    };
    
    Constants.tableConfig.temp.pettyCashTallyGuid = section.guid;

    return section;
  }

  function _getPettyCash() {
    var inflowFromHousehold = {
      type    : 'lineItem',
      title   : 'inflow from household',
      name    : 'inflowFromHousehold',
      guid    : Utilities.guid(),
      seedData: {
        seedDataType: 'dependent',
      }
    };
    Constants.tableConfig.temp.inflowFromHouseholdGuid = inflowFromHousehold.guid;

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
      outflowToHousehold,
    ];
  }

}
