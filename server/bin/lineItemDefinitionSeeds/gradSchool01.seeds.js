'use strict'

var externalSeeds = {};
externalSeeds.getPettyCashSeeds        = require('../../bin/lineItemDefinitionSeeds/pettyCash.seeds.js');
externalSeeds.getemergencyFundSeeds    = require('../../bin/lineItemDefinitionSeeds/emergencyFund.seeds.js');
externalSeeds.getHouseDownPaymentSeeds = require('../../bin/lineItemDefinitionSeeds/houseDownPaymentFund.seeds.js');

var simplify = false;
var simplify = true;
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
      date  : new Date('01/01/2017'),
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
    externalSeeds.getHouseDownPaymentSeeds(),
    // Four01kDb.blocks[0],
    // StockDb.blocks[0],
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
    // collapsed: true,
    name     : 'adjustments',
    type     : 'section',
    children : _getAdjustments(),
  };

  var cash = {
    // collapsed: true,
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

  if (simplify) {
    return [
      inflows,
      outflows,
    ];
    
  }

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
  var paycheck = 3000;
  if (globalParams.study === 'getMba'){
    paycheck = 1000;
  }
  
  var mattPaycheck = {
    type    : 'lineItem',
    name    : 'matt paycheck',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : '05/01/2017',
        amount      : paycheck,
      },
      numDaysInInterval: 15,
    }
  };

  var penPaycheck = {
    type    : 'lineItem',
    name    : 'pen  paycheck',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : null,
        amount      : 3000,
      },
      numDaysInInterval: 15,
    }
  };

  var irregularInflows = {
    collapsed: true,
    name     : 'irregular payments',
    type     : 'section',
    children : _getIrregularInflows(),
  };

  return [
    mattPaycheck,
    penPaycheck,
    irregularInflows,
  ];
}

function _getIrregularInflows() {
  var taxRefund = {
    name    : 'tax refund',
    type    : 'lineItem',
    seedData: {
      seedDataType: 'arbitraryDates',
      payments    : [
        {date : '03/07/2017', amount: 5000},
      ]
    }
  };

  var penBonus = {
    type    : 'lineItem',
    name    : 'pen bonus',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : null,
        amount      : 2000,
      },
      numDaysInInterval: 180,
    }
  };

  var mattUnemployment = {
    type    : 'lineItem',
    name    : 'matt unemployment',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : '03/01/2017',
        amount      : 450,
      },
      numDaysInInterval: 7,
    }
  };

  return [
    // taxRefund,
    mattUnemployment,
    penBonus,
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
      initialPayment     : {
        date        : null,
        amount      : -2000,
      },
      numDaysInInterval: 30,
    }
  };
  
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
  
  var montessori = {
    collapsed   : true,
    name        : 'montessori',
    type        : 'section',
    children    : _getMontessori(),
  };

  var transportation = {
    collapsed   : true,
    name        : 'transportation',
    type        : 'section',
    children    : _getTransportation(),
  };

  var medical = {
    collapsed   : true,
    name        : 'medical',
    type        : 'section',
    children    : _getMedical(),
  };

  if (simplify) {
    return [
      rent,
      groceries,
      // montessori,
      // transportation,
      // medical,
    ];
    
  }

  return [
    rent,
    groceries,
    montessori,
    transportation,
    medical,
  ];
  
}

function _getTransportation(){
  var car = {
    name        : 'car',
    type        : 'section',
    children    : _car(),
  };
  
  var penBart = {
    name    : 'pen BART',
    type    : 'lineItem',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : null,
        amount      : -10,
      },
      numDaysInInterval: 1,
    }
  };
  
  var mattBart = {
    name    : 'matt BART',
    type    : 'lineItem',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : null,
        amount      : -7,
      },
      numDaysInInterval: 1,
    }
  };
  
  return [
    car,
    penBart,
    mattBart,
  ];
}

function _car(){
  var initialPayment = {
    date  : null,
    amount: -50,
  };

  var seedData = {
    seedDataType     : 'periodicDates',
    initialPayment   : initialPayment,
    numDaysInInterval: 30,
  };

  var carInsurance = {
    name    : 'car insurance',
    type    : 'lineItem',
    // guid    : Utilities.guid(),
    seedData: seedData,
  };
  
  var carMaintenance = {
    name    : 'car maintenance',
    type    : 'lineItem',
    // guid    : Utilities.guid(),
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : null,
        amount      : -25,
      },
      numDaysInInterval: 31,
    }
  };
  
  return [
    carInsurance,
    carMaintenance,
  ];
}

function _getMedical(){
  var therapy = {
    name    : 'therapy',
    type    : 'lineItem',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : null,
        amount      : -50,
      },
      numDaysInInterval: 7,
    }
  };
  
  var doctor = {
    name    : 'doctor',
    type    : 'lineItem',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : null,
        amount      : -50,
      },
      numDaysInInterval: 30,
    }
  };
  
  var dentist = {
    name    : 'dentist',
    type    : 'lineItem',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : null,
        amount      : -100,
      },
      numDaysInInterval: 90,
    }
  };
  
  return [
    therapy,
    doctor,
    dentist
  ];
}

function _getMontessori(){
  var tuition = {
    name    : 'tuition',
    type    : 'lineItem',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        :null,
        amount      : -2100,
      },
      numDaysInInterval: 30,
    }
  };
  
  var teacherGifts = {
    name    : 'teacher gifts',
    type    : 'lineItem',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        :null,
        amount      : -50,
      },
      numDaysInInterval: 180,
    }
  };
  
  var holidayCare = {
    name    : 'holiday care',
    type    : 'lineItem',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        :null,
        amount      : -80,
      },
      numDaysInInterval: 30,
    }
  };
  
  var summerCamp = {
    name    : 'summer camp',
    type    : 'lineItem',

    seedData: {
      seedDataType: 'arbitraryDates',
      payments    : [
        {date : '06/07/2017', amount: -350},
      ]
    }
  };
  
  return [
    tuition,
    teacherGifts,
    holidayCare,
    // summerCamp,
  ];
}

module.exports = getTopBlock;