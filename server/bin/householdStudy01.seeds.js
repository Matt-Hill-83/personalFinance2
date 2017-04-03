function getStudy() {
  var householdBlocks = require('./lineItemDefinitionSeeds/household.seeds.js');
  
  var rule1 = {
    "name"                : "household to petty cash",
    "function"            : "moveUntilFull",

    "sourceGuid"          : 'cash net',
    "destinationGuid"     : 'petty cash',
    "outflowLineItemGuid" : 'household outflow to petty cash',
    "inflowLineItemGuid"  : 'petty cash inflow from household',

    "sourceMinAmount"     : 0,
    "destinationMaxAmount": 10000,
  };
  
  var rule2 = {
    "name"                : "household to emergency",
    "function"            : "moveUntilFull",

    "sourceGuid"          : 'cash net',
    "outflowLineItemGuid" : 'household outflow to emergency',

    "destinationGuid"     : 'emergency fund',
    "inflowLineItemGuid"  : 'emergency inflow from household',

    "sourceMinAmount"     : 0,
    "destinationMaxAmount": 30000,
  };
  
  var rule3 = {
    "name"                : "household to home payment",
    "function"            : "moveUntilFull",

    "sourceGuid"          : 'cash net',
    "outflowLineItemGuid" : 'household outflow to home',

    "destinationGuid"     : 'house downpayment',
    "inflowLineItemGuid"  : 'home payment inflow from household',

    "sourceMinAmount"     : 0,
    "destinationMaxAmount": 200000,
  };

  var scenario1 = {
    name  : 'household base',
    block : householdBlocks(),
  };

  var scenario2 = {
    name  : 'household modified',
    block : householdBlocks(),
  };

  var scenarios = [
    scenario1,
    // scenario2
  ];

  scenarios.forEach(scenario=> {
    scenario.block.parentGuid = -1;
    scenario.ruleSeeds = [
      rule1,
      rule2,
      rule3
    ];
  });

  var charts = [
    {
      name         : 'cool stuff1',
      lineItemGuids: '[1,2]',
    },
    {
      name         : 'cool stuff2',
      lineItemGuids: '[3,4]',
    },
  ];

  var study = {
    name     : 'household', 
    scenarios: scenarios,
    charts   : charts
  };

  return study;

}
module.exports = getStudy;
