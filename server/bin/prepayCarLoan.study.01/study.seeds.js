function getStudy() {
  var householdBlocks = require('./blocks.seeds.js');
  
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
    "name"                : "household to savings",
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
    "destinationMaxAmount": 0,
  };

  var scenario1 = {
    name  : 'follow loan schedule',
    block : householdBlocks(params={}),
  };

  var params = {study: 'getMba'};
  var scenario2 = {
    name  : 'pay an extra $10k in year 2',
    block : householdBlocks(params),
  };

  var scenarios = [
    scenario1,
    scenario2
  ];

  scenarios.forEach(scenario=> {
    scenario.block.parentGuid = -1;
  });

  scenarios[0].ruleSeeds = [
    // rule4,
    rule3,
  ];

  scenarios[1].ruleSeeds = [
    rule4,
    rule3,
  ];

  var charts = [
    {
      name         : 'Net Worth',
      subTitle     : 'base case vs. $10k prePayment',
      lineItemGuids: '[-1]', // arbitrary code to be used when creating charts for seed data
    },
    // {
    //   name         : 'At what point will I pay off my student loan?',
    //   subTitle     : 'grad school',
    //   lineItemGuids: '[-3]', // arbitrary code to be used when creating charts for seed data
    // },
  ];

  var descriptionStrings = [
    'On what date will I break even financially after going to grad school?'
    // 'On what date will I have $10,00 in the bank after grad school?',
  ];

  var description = descriptionStrings.join();
  var study = {
    name       : 'Should I prePay on my Car Loan?', 
    // description: description, 
    scenarios  : scenarios,
    charts     : charts,
  };

  return study;

}
module.exports = getStudy;
