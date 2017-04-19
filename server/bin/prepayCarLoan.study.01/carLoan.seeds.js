'use strict'

var globalParams = {};

function getAllBlocks(params) {
  var name = 'car loan';
  globalParams = params;

  var tally = {
    annualEscalationPct: 20,
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
    ruleAlias: 'student loan inflow from household',
    type     : 'lineItem',
    name     : 'inflow from household',
  };

  var loan = {
    type    : 'lineItem',
    name    : 'car loan',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : '01-01-2017',
        amount      : -60000,
      },
      numDaysInInterval: 180,
      numPayments      : 1,
    }
  };

  var children = [
      inflowFromHousehold,
      loan,
  ];

  var loanPrepayIn = {
    name    : 'loanPrepayIn',
    type    : 'lineItem',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : '06-01-2017',
        amount      : 10000,
      },
      numPayments: 1,
    }
  };

  if (globalParams.study === 'getMba') {
    children.push(loanPrepayIn);
  }
  return children;
}

module.exports = getAllBlocks;

