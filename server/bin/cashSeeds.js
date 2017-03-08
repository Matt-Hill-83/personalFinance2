'use strict'

  var externalSeeds = {};
  externalSeeds.getPettyCashSeeds = require('../bin/pettyCashSeeds.js');
  
  var mattJobStart = '05/01/2017';

  function getAllBlocks() {
    var topLevel = {
      name    : 'topLevel',
      title   : 'top level',
      type    : 'section',
      parents : [{}],
      children: tables(),
    };

    return [topLevel];
  }

  function tables() {
    var tally = {
      title              : 'total cash',
      annualEscalationPct: 0.0,
      name               : 'cashTally',
      type               : 'tally',
      classes            : ['cashTally'],
      initialPayment     : {
        amount: 0,
        date  : new Date('01/01/2017'),
      },
    };

    var net = {
      name    : 'cash net',
      title   : 'cash net',
      // tally   : tally,
      type    : 'section',
      parents : [{}],
      children: getNet(),
    };

    return [
      net,
      // externalSeeds.getPettyCashSeeds(),
      // EmergencyFund.blocks,
      // HomeDownPayment.blocks,
      // Four01kDb.blocks[0],
      // StockDb.blocks[0],
    ];
  }

  function getNet() {
    var adjustments = {
      name    : 'adjustments',
      title   : 'adjustments',
      type    : 'section',
      parents : [{}],
      children: _getAdjustments(),
    };


    var cash = {
      name    : 'cashSection',
      title   : 'cash gross',
      type    : 'section',
      children: getCashBlocks(),
    };

    return [
      cash,
      // adjustments,
    ];
  }

  function getCashBlocks() {
    var inflows = {
      name    : 'inflows',
      title   : 'inflows',
      type    : 'section',
      children: _getInflows(),
    };

    var outflows = {
      title   : 'outflows',
      name    : 'outflows',
      negate  : true,
      type    : 'section',
      children: _getOutflows(),
    };

    return [
      inflows,
      outflows,
    ];
  }

  function _getAdjustments(){
    var outflowToPettyCash = {
      type      : 'lineItem',
      title     : 'outflowToPettyCash',
      name      : 'outflowToPettyCash',
      seedData: {
        seedDataType: 'calculated',
        // function    : 'outflowToPettyCash',
      },
    };


    var outflowToEmergencyFund = {
      type      : 'lineItem',
      title     : 'outflowToEmergencyFund',
      name      : 'outflowToEmergencyFund',
      seedData: {
        seedDataType: 'calculated',
      },
    };

    var outflowToHomeDownPayment = {
      type      : 'lineItem',
      title     : 'outflowToHomeDownPayment',
      name      : 'outflowToHomeDownPayment',
      seedData: {
        seedDataType: 'calculated',
      },
    };

    var outflowToStudentLoan = {
      type      : 'lineItem',
      title     : 'outflowToStudentLoan',
      name      : 'outflowToStudentLoan',
      seedData: {
        seedDataType: 'calculated',
      },
    };

    return [
      outflowToPettyCash,
      outflowToEmergencyFund,
      outflowToHomeDownPayment,
      outflowToStudentLoan,
    ];
  };

  function _getInflows(){
    var mattPaycheck = {
      type    : 'lineItem',
      title   : 'matt paycheck',
      name    : 'mattPaycheck',
      seedData: {
        seedDataType: 'periodicDates',
        initialPayment     : {
          date        : '01/01/2017',
          amount      : 3000,
        },
        numDaysInInterval: 15,
      }
    };

    var penPaycheck = {
      type    : 'lineItem',
      title   : 'pen  paycheck',
      name    : 'penPaycheck',
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
      title    : 'irregular payments',
      name     : 'irregularInflows',
      collapsed: true,
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
      title   : 'tax refund',
      name    : 'taxRefund',
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
      title   : 'pen bonus',
      name    : 'penBonus',
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
      title   : 'matt unemployment',
      name    : 'mattUnemployment',
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
      title   : 'groceries',
      name    : 'groceries',
      type    : 'lineItem',
      seedData: {
        seedDataType: 'periodicDates',
        initialPayment     : {
          date        : null,
          amount      : 200,
        },
        numDaysInInterval: 7,
      }
    };
    
    var rent = {
      title   : 'rent',
      name    : 'rent',
      type    : 'lineItem',
      seedData: {
        seedDataType: 'periodicDates',
        initialPayment     : {
          date        : null,
          amount      : 2000,
        },
        numDaysInInterval: 30,
      }
    };
    
    var groceries = {
      title   : 'groceries',
      name    : 'groceries',
      type    : 'lineItem',
      seedData: {
        seedDataType: 'periodicDates',
        initialPayment     : {
          date        : null,
          amount      : 200,
        },
        numDaysInInterval: 7,
      }
    };
    
    var montessori = {
      collapsed   : true,
      title       : 'montessori',
      name        : 'montessori',
      type        : 'section',
      children    : _getMontessori(),
    };

    var transportation = {
      // collapsed   : true,
      title       : 'transportation',
      name        : 'transportation',
      type        : 'section',
      children    : _getTransportation(),
    };

    var medical = {
      collapsed   : true,
      title       : 'medical',
      name        : 'medical',
      type        : 'section',
      children    : _getMedical(),
    };

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
      title       : 'car',
      name        : 'car',
      type        : 'section',
      children    : _car(),
    };
    
    var penBart = {
      title   : 'pen BART',
      name    : 'penBart',
      type    : 'lineItem',
      seedData: {
        seedDataType: 'periodicDates',
        initialPayment     : {
          date        : null,
          amount      : 10,
        },
        numDaysInInterval: 1,
      }
    };
    
    var mattBart = {
      title   : 'matt BART',
      name    : 'mattBart',
      type    : 'lineItem',
      seedData: {
        seedDataType: 'periodicDates',
        initialPayment     : {
          date        : null,
          amount      : 7,
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


////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

function _car(){
  var initialPayment = {
    date  : null,
    amount: 50,
  };

  var seedData = {
    seedDataType     : 'periodicDates',
    initialPayment   : initialPayment,
    numDaysInInterval: 30,
  };

  var carInsurance = {
    title   : 'car insurance',
    name    : 'car insurance',
    type    : 'lineItem',
    // guid    : Utilities.guid(),
    seedData: seedData,
  };
  
  var carMaintenance = {
    title   : 'car maintenance',
    name    : 'car maintenance',
    type    : 'lineItem',
    // guid    : Utilities.guid(),
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : null,
        amount      : 25,
      },
      numDaysInInterval: 31,
    }
  };
  
  return [
    carInsurance,
    carMaintenance,
  ];
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

  function _getMedical(){
    var therapy = {
      title   : 'therapy',
      name    : 'therapy',
      type    : 'lineItem',
      seedData: {
        seedDataType: 'periodicDates',
        initialPayment     : {
          date        : null,
          amount      : 50,
        },
        numDaysInInterval: 7,
      }
    };
    
    var doctor = {
      title   : 'doctor',
      name    : 'doctor',
      type    : 'lineItem',
      seedData: {
        seedDataType: 'periodicDates',
        initialPayment     : {
          date        : null,
          amount      : 50,
        },
        numDaysInInterval: 30,
      }
    };
    
    var dentist = {
      title   : 'dentist',
      name    : 'dentist',
      type    : 'lineItem',
      seedData: {
        seedDataType: 'periodicDates',
        initialPayment     : {
          date        : null,
          amount      : 100,
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
      title   : 'tuition',
      name    : 'tuition',
      type    : 'lineItem',
      seedData: {
        seedDataType: 'periodicDates',
        initialPayment     : {
          date        :null,
          amount      : 2100,
        },
        numDaysInInterval: 30,
      }
    };
    
    var teacherGifts = {
      title   : 'teacher gifts',
      name    : 'teacherGifts',
      type    : 'lineItem',
      seedData: {
        seedDataType: 'periodicDates',
        initialPayment     : {
          date        :null,
          amount      : 50,
        },
        numDaysInInterval: 180,
      }
    };
    
    var holidayCare = {
      title   : 'holiday care',
      name    : 'holidayCare',
      type    : 'lineItem',
      seedData: {
        seedDataType: 'periodicDates',
        initialPayment     : {
          date        :null,
          amount      : 80,
        },
        numDaysInInterval: 30,
      }
    };
    
    var summerCamp = {
      title   : 'summer camp',
      name    : 'summerCamp',
      type    : 'lineItem',

      seedData: {
        seedDataType: 'arbitraryDates',
        payments    : [
          {date : '06/07/2017', amount: 350},
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



module.exports = getAllBlocks;