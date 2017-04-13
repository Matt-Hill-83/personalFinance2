function getStudy() {
  var householdBlocks = require('./gradSchool.01.blocks.seeds.js');
  
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
    "destinationMaxAmount": 1000000,
  };

  var rule4 = {
    "name"                : "household to student loan",
    "function"            : "moveUntilFull",

    "sourceGuid"          : 'cash net',
    "outflowLineItemGuid" : 'household outflow to student loan',

    "destinationGuid"     : 'student loan',
    "inflowLineItemGuid"  : 'student loan inflow from household',

    "sourceMinAmount"     : 0,
    "destinationMaxAmount": 5,
  };

  var scenario1 = {
    name  : 'continue at current job',
    block : householdBlocks(params={}),
  };

  var params = {study: 'getMba'}
  // var params = {study: ''}
  var scenario2 = {
    name  : 'get a Master\'s degree',
    block : householdBlocks(params),
  };

  var scenarios = [
    scenario1,
    scenario2
  ];

  scenarios.forEach(scenario=> {
    scenario.block.parentGuid = -1;
    scenario.ruleSeeds = [
      // rule1,
      rule4,
      rule3,
      // rule2,
    ];
  });

  var charts = [
    {
      name         : 'net worth',
      subTitle     : 'base case vs. grad school',
      lineItemGuids: '[-1]',
    },
    {
      name         : 'cash accumulation by BUCKET',
      subTitle     : 'base case',
      lineItemGuids: '[-3]',
    },
  ];

  var descriptionStrings = [
    'On what date will I break even financially after going to grad school?'
    // 'On what date will I have $10,00 in the bank after grad school?',
  ];

  var description = descriptionStrings.join();
  var study = {
    name       : 'Is grad school worth it?', 
    description: description, 
    scenarios  : scenarios,
    charts     : charts,
  };

  return study;

}
module.exports = getStudy;
