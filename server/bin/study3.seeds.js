function getStudys() {
  var scenario1 = {
    name  : 'scenario 1',
    block : getAllBlocks(),
  };

  var scenario2 = {
    name  : 'scenario 2',
    block : getAllBlocks(),
  };

  var scenarios = [scenario1, scenario2];
  scenarios.forEach(scenario=> scenario.block.parentGuid = -1);

  var study1 = {
    name     : 'car loan length', 
    scenarios: scenarios,
  };

  return study1;
}

function getAllBlocks() {
  var topLevel = {
    name    : 'top level',
    type    : 'section',
    children: getNetTally(),
  };

  return topLevel;
}

function getNetTally() {
  var tally = {
    name               : 'total cash',
    annualEscalationPct: 0.0,
    type               : 'tally',
    classes            : ['cashTally'],
    tallyPayment     : {
      amount: 888,
      date  : new Date('01/01/2017'),
    },
  };

  var topLevel = {
    tally   : tally,
    name    : 'net tally',
    type    : 'section',
    children: getNet(),
  };

  return [topLevel];
}

function getNet() {
  var cash = {
    name    : 'cash gross',
    type    : 'section',
    children: getCashBlocks(),
  };

  return [
    cash,
  ];
}

function getCashBlocks() {
  var inflows = {
    name    : 'inflows',
    type    : 'section',
    children: _getInflows(),
  };

  var outflows = {
    name    : 'outflows',
    type    : 'section',
    children: _getOutflows(),
  };

  return [
    inflows,
    outflows,
  ];
}

function _getInflows(){
  var mattPaycheck = {
    type    : 'lineItem',
    name    : 'Mr. Smart paycheck',
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
    name    : 'Mrs. Smart paycheck',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date        : null,
        amount      : 3000,
      },
      numDaysInInterval: 15,
    }
  };

  return [
    mattPaycheck,
    penPaycheck,
  ];
}

function _getOutflows(){
  var rent = {
    name    : 'rent',
    type    : 'lineItem',
    seedData: {
      seedDataType: 'periodicDates',
      initialPayment     : {
        date  : null,
        amount: -2000,
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
        date  : null,
        amount: -300,
      },
      numDaysInInterval: 7,
    }
  };
  

  return [
    rent,
    groceries,
  ];
}

module.exports = getStudys;
