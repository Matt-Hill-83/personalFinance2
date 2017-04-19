'use strict'

var globalParams = {};

function getAllBlocks(params) {
  globalParams = params;
  var name = 'savings';

  var tally = {
    annualEscalationPct: 4,
    type        : 'tally',
    tallyPayment: {
      amount: 10000,
      date  : null,
    },
  };

  var tallyInterest = {
    type    : 'lineItem',
    subtype1: 'interest',
    name    : name + ' interest',
  };
  
  var children = _getChildren();
  children.push(tallyInterest);

  var section = {
    collapsed: true,
    name     : name,
    type     : 'section',
    ruleAlias: 'house downpayment',
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
  var children = [inflowFromHousehold];

  var loanPrepayOut = {
    name    : 'loanPrepayOut',
    type    : 'lineItem',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : '06-01-2017',
        amount      : -10000,
      },
      numPayments: 1,
    }
  };

  if (globalParams.study === 'getMba') {
    children.push(loanPrepayOut);
  }
  return children;
}

module.exports = getAllBlocks;

