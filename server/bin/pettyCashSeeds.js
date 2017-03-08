"use strict"

function middleManager() {
  var tally = {
    annualEscalationPct: 0.000,
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
    tally   : tally,
  };
  
  return section;
}

function _getPettyCash() {
  var inflowFromHousehold = {
    type    : 'lineItem',
    title   : 'inflow from household',
    name    : 'inflowFromHousehold',
    seedData: {
      seedDataType: 'dependent',
    }
  };

  var outflowToHousehold = {
    type    : 'lineItem',
    title   : 'outflow to household',
    name    : 'outflowToHousehold',
    seedData: {
      seedDataType: 'dependent',
    }
  };

  return [
    inflowFromHousehold,
    outflowToHousehold,
  ];
}

module.exports = middleManager;
