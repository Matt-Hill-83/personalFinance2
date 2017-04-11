function getStudy() {
  var householdBlocks = require('./lineItemDefinitionSeeds/gradSchool01.seeds.js');
  
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
    name  : 'base case',
    block : householdBlocks(params={}),
  };

  var params = {study: 'getMba'}
  var scenario2 = {
    name  : 'frugal living',
    block : householdBlocks(params),
  };

  var scenarios = [
    scenario1,
    scenario2
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
      name         : 'total cash',
      subTitle     : 'base case',
      lineItemGuids: '[-2]',
    },
    {
      name         : 'house downpayment growth',
      subTitle     : 'base case vs. frugal living',
      lineItemGuids: '[-1]',
    },
  ];

  var descriptionStrings = [
    'On what date will I break even financially after going to grad school?'
    // 'On what date will I have $10,00 in the bank after grad school?',
  ];

  var description = descriptionStrings.join();
  var study = {
    name       : 'Is grad school worth it???', 
    description: description, 
    scenarios  : scenarios,
    charts     : charts,
    user       : 'none'
  };

  return study;

}
module.exports = getStudy;
