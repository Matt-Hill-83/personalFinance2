"use strict"
angular.module('app').factory('HomeDownPayment', [
  'Constants',
  'Utilities',
  HomeDownPayment
  ]);

function HomeDownPayment(
  Constants,
  Utilities
  ) {
  var service = {
    blocks : middleManager(),
  };

  return service;

  ///////////////

  function middleManager() {
    Constants.tableConfig.temp.homeDownPayment = {};

    var initialPayment = {
      amount: 0,
      date  : new Date('01/01/2017'),
    };

    var tally = {
      annualEscalationPct: 0.000,
      initialPayment     : initialPayment,
    };

    var section = {
      title   : 'home downpayment',
      type    : 'section',
      children: _getChildren(),
      guid    : Utilities.guid(),
      tally   : tally,
    };
    Constants.tableConfig.temp.homeDownPayment.tallyGuid = section.guid;

    return section;
  }

  function _getChildren() {
    var seedData = {
      seedDataType: 'dependent',
    };

    var inflowFromHousehold = {
      type    : 'lineItem',
      title   : 'inflow from household',
      guid    : Utilities.guid(),
      seedData: seedData,
    };
    Constants.tableConfig.temp.homeDownPayment.inflowFromHouseholdGuid = inflowFromHousehold.guid;

    return [
      inflowFromHousehold,
    ];
  }

}
