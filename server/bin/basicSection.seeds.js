"use strict"

function getNewSection() {
  return {
    name    : 'new section',
    type    : 'section',
    children: _getChildren(),
  };
}

function _getChildren(){
  var expense1 = {
    name    : 'expense1',
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
  
  var expense2 = {
    name    : 'expense2',
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
    expense1,
    expense2,
  ];
}

module.exports = getNewSection;

