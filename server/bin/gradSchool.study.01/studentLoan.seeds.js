'use strict'

var globalParams = {};

function getAllBlocks(params) {
  var name = 'student loan';
  globalParams = params;

  var tally = {
    annualEscalationPct: 4,
    type        : 'tally',
    tallyPayment: {
      amount: 0,
      date  : '01/01/2017',
    },
  };

  var tallyInterest = {
    type    : 'lineItem',
    subtype1: 'interest',
    name    : name + ' interest',
  };
  
  var children =  _getChildren();
  children.push(tallyInterest);

  var section = {
    collapsed: true,
    name     : name,
    type     : 'section',
    ruleAlias: 'student loan',
    children : children,
    tally    : tally,
  };

  return section;
}

function _getChildren() {
  var inflowFromHousehold = {
    ruleAlias: 'home payment inflow from household',
    type     : 'lineItem',
    name     : 'inflow from household',
  };

  var tuition = {
    type    : 'lineItem',
    name    : 'tuition',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : '01-01-2017',
        amount      : -10000,
      },
      numDaysInInterval: 180,
      numPayments      : 4,
    }
  };

  var children;
  if (globalParams.study === 'getMba') {
    console.log('getMba');
    children = [
        inflowFromHousehold,
        tuition,
    ];
  } else {
    children = [
      inflowFromHousehold,
    ];
  }
  return children;
}

module.exports = getAllBlocks;

