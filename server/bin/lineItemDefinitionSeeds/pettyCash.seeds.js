"use strict"

function pettyCashBucket() {
  var name = 'petty cash';

  var tally = {
    annualEscalationPct: 3.0,
    type               : 'tally',
    tallyPayment     : {
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
    ruleAlias: 'petty cash',
    name     : name,
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
    ruleAlias: 'petty cash inflow from household',
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

module.exports = pettyCashBucket;
