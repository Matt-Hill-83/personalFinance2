'use strict'

function getAllBlocks() {
  var name = 'emergency fund';

  var tally = {
    annualEscalationPct: 5,
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
    ruleAlias: 'emergency fund',
    type     : 'section',
    children : children,
    tally    : tally,
  };

  return section;
}

function _getChildren() {
  var inflowFromHousehold = {
    type     : 'lineItem',
    name     : 'inflow from household',
    ruleAlias: 'emergency inflow from household',
  };

  var outflowToHousehold = {
    type    : 'lineItem',
    name    : 'outflow to household',
  };

  return [
    inflowFromHousehold,
    // outflowToHousehold,
  ];
}

module.exports = getAllBlocks;
