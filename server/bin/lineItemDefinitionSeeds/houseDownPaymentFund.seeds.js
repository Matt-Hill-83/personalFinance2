'use strict'

function getAllBlocks() {
  var name = 'house downpayment';

  var tally = {
    annualEscalationPct: 4,
    type        : 'tally',
    tallyPayment: {
      amount: 0,
      date  : new Date('01/01/2017'),
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

