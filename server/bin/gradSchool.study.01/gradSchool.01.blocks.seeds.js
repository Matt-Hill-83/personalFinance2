'use strict'

var externalSeeds = {};
externalSeeds.getPettyCash     = require('./pettyCash.seeds.js');
externalSeeds.getEmergencyFund = require('./emergencyFund.seeds.js');
externalSeeds.getStudentLoan   = require('./studentLoan.seeds.js');
externalSeeds.houseDownPayment = require('./houseDownPayment.seeds.js');

var simplify     = false;
var simplify     = true;
var globalParams = {};

function getTopBlock(params) {
  globalParams = params;
  
  return {
    name    : 'top level',
    type    : 'section',
    children: getBucketSummary(),
  };
}

function getBucketSummary() {
  var bucketSummary = {
    name    : 'total of BUCKETS',
    type    : 'section',
    subtype1: 'total of tallies',
    children: getBuckets(),
  };

  return [
    bucketSummary,
  ];
}

function getBuckets() {
  var name = 'household';

  var tally = {
    annualEscalationPct: 3,
    type               : 'tally',
    tallyPayment       : {
      amount: 0,
      date  : null,
    },
  };

  var tallyInterest = {
    type    : 'lineItem',
    subtype1: 'interest',
    name    : name + ' interest',
  };
  
  var children = getHouseholdNetBucket();
  children.push(tallyInterest);

  var householdNetBucket = {
    name     : 'household',
    tally    : tally,
    type     : 'section',
    children : children,
  };

  var blocks;
  if (globalParams.study !== 'getMba') {
    blocks = [
      householdNetBucket,
      // externalSeeds.getPettyCash(globalParams),
      externalSeeds.houseDownPayment(globalParams),
    ];
  } else {
    blocks = [
      householdNetBucket,
      // externalSeeds.getPettyCash(globalParams),
      externalSeeds.getStudentLoan(globalParams),
      externalSeeds.houseDownPayment(globalParams),
    ];
  }
  return blocks;


}

function getHouseholdNetBucket() {
  var householdNetSection = {
    name     : 'household after transfers',
    type     : 'section',
    ruleAlias: 'cash net',
    children : getHouseholdNet(),
  };

  return [
    householdNetSection,
  ];
}

function getHouseholdNet() {
  var adjustments = {
    collapsed: true,
    name     : 'transfer cash into BUCKETS',
    type     : 'section',
    children : _getAdjustments(),
  };

  var cash = {
    // collapsed: true,
    name     : 'household before transfers',
    type     : 'section',
    children : getHouseholdGross(),
  };

  return [
    cash,
    adjustments,
  ];
}

function getHouseholdGross() {
  var inflows = {
    collapsed: true,
    name     : 'inflows',
    type     : 'section',
    children: _getInflows(),
  };

  var outflows = {
    collapsed: true,
    name     : 'outflows',
    type     : 'section',
    children : _getOutflows(),
  };

  return [
    inflows,
    outflows,
  ];
}

function _getAdjustments(){
  var outflowToPettyCash = {
    type     : 'lineItem',
    name     : 'outflowToPettyCash',
    ruleAlias: 'household outflow to petty cash',
  };

  var outflowToEmergencyFund = {
    ruleAlias: 'household outflow to emergency',
    type     : 'lineItem',
    name     : 'outflowToEmergencyFund',
  };

  var outflowToStudentLoan = {
    ruleAlias: 'household outflow to student loan',
    type     : 'lineItem',
    name     : 'outflow to student loan',
  };

  var outflowToHomeDownPayment = {
    ruleAlias: 'household outflow to home',
    type     : 'lineItem',
    name     : 'outflow to savings',
  };

  var children;
  if (globalParams.study !== 'getMba') {
    children = [
      outflowToHomeDownPayment,
    ];
  } else {
    children = [
      // outflowToPettyCash,
      // outflowToEmergencyFund,
      outflowToStudentLoan,
      outflowToHomeDownPayment,
    ];
  }
  return children;
}

function _getInflows(){
  var oldPaycheckAmount1 = 2200;
  var paycheckAmount2    = oldPaycheckAmount1 * 0.8;
  var newPaycheckAmount  = oldPaycheckAmount1 * 2;

  var mattPaycheck1 = {
    type    : 'lineItem',
    name    : 'MeanCorp paycheck',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date  : null,
        amount: oldPaycheckAmount1,
      },
      numDaysInInterval: 15,
    }
  };

  var mattPaycheck2 = {
    type    : 'lineItem',
    name    : 'MeanCorp paycheck',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date  : null,
        amount: paycheckAmount2,
      },
      numDaysInInterval: 15,
      numPayments      : 52,
    }
  };

  var funCoPaycheck = {
    type    : 'lineItem',
    name    : 'FunCo paycheck',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : '01/01/2019',
        amount      : newPaycheckAmount,
      },
      numDaysInInterval: 15,
    }
  };

  var children;
  if (globalParams.study !== 'getMba') {
    children = [mattPaycheck1]
  } else {
    children = [mattPaycheck2, funCoPaycheck]
  }
  return children;
}

function _getIrregularOutflows() {
  var tuition = {
    type    : 'lineItem',
    name    : 'tuition',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : '02-01-2017',
        amount      : -15000,
      },
      numDaysInInterval: 180,
    }
  };

  return [
    tuition,
  ];
}

function _getOutflows(){
  var groceries = {
    name    : 'groceries',
    type    : 'lineItem',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : null,
        amount      : -200,
      },
      numDaysInInterval: 7,
    }
  };
  
  var rent = {
    name    : 'rent',
    type    : 'lineItem',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment: {
        date        : null,
        amount      : -2000,
      },
      numDaysInInterval: 30,
    }
  };
  
  var irregularOutflows = {
    collapsed: true,
    name     : 'irregular outflows',
    type     : 'section',
    children : _getIrregularOutflows(),
  };

    return [
      rent,
      groceries,
      // irregularOutflows,
    ];
}

module.exports = getTopBlock;
