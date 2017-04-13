'use strict'

var externalSeeds = {};
externalSeeds.getPettyCashSeeds        = require('./pettyCash.seeds.js');
externalSeeds.getemergencyFundSeeds    = require('./emergencyFund.seeds.js');
externalSeeds.getHouseDownPaymentSeeds = require('./studentLoan.seeds.js');

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
      date  : '01/01/2017',
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

  return [
    householdNetBucket,
    externalSeeds.getPettyCashSeeds(),
    externalSeeds.getemergencyFundSeeds(),
    externalSeeds.getHouseDownPaymentSeeds(globalParams),
  ];
}

function getHouseholdNetBucket() {
  var householdNetSection = {
    name     : 'household net',
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
    name     : 'move cash between BUCKETS',
    type     : 'section',
    children : _getAdjustments(),
  };

  var cash = {
    collapsed: true,
    name     : 'household gross',
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
    // collapsed: true,
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

  var outflowToHomeDownPayment = {
    ruleAlias: 'household outflow to home',
    type     : 'lineItem',
    name     : 'outflowToHomeDownPayment',
  };

  var outflowToStudentLoan = {
    ruleAlias: 'household outflow to student loan',
    type     : 'lineItem',
    name     : 'outflowToStudentLoan',
  };

  return [
    outflowToPettyCash,
    outflowToEmergencyFund,
    outflowToHomeDownPayment,
    // outflowToStudentLoan,
  ];
}

function _getInflows(){
  var mattPaycheck = {
    type    : 'lineItem',
    name    : 'MeanCorp paycheck',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : '01/01/2017',
        amount      : 1500,
      },
      numDaysInInterval: 15,
    }
  };

  var funCoPaycheck = {
    type    : 'lineItem',
    name    : 'FunCo paycheck',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : '01/01/2017',
        amount      : 1500,
      },
      numDaysInInterval: 15,
    }
  };

  var irregularInflows = {
    collapsed: true,
    name     : 'irregular inflows',
    type     : 'section',
    children : _getIrregularInflows(),
  };

  return [
    mattPaycheck,
    funCoPaycheck,
    // irregularInflows,
  ];
}

function _getIrregularInflows() {
  var taxRefund = {
    name    : 'tax refund',
    type    : 'lineItem',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : '03/05/2017',
        amount      : 1000,
      },
      numDaysInInterval: 365,
    }
  };

  return [
    taxRefund,
  ];
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
