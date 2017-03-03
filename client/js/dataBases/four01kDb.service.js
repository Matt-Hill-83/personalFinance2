"use strict"
angular.module('app').factory('Four01kDb', ['Utilities', Four01kDb]);

function Four01kDb(Utilities) {
  var service = {
    blocks : middleManager(),
  };

  return service;

  ///////////////

  function middleManager() {
    // var tally = {
    //   title         : '401k',
    //   annualEscalationPct     : 0.10,
    //   name          : 'Four01Tally',
    //   guid          : Utilities.guid(),
    //   type          : 'tally',
    //   classes       : ['cashTally'],
    //   initialPayment: {
    //     amount: 100,
    //     date  : new Date('01/01/2016'),
    //   },
    //   lineItemsToTally: [
    //     {
    //       guid: null,
    //       name: 'netIncome',
    //     }
    //   ]
    // };

    var section = {
      name    : 'middleManager',
      title   : '401k',
      type    : 'section',
      parents : [{}],
      children: getStock(),
      guid    : Utilities.guid(),
      // tally   : tally,
    };

    return [section];
  }

  function getStock() {
    var tally = {
      title              : '401k',
      annualEscalationPct: 0.10,
      name               : 'Four01Tally',
      guid               : Utilities.guid(),
      type               : 'tally',
      classes            : ['tally'],
      initialPayment     : {
        amount: 100,
        date  : new Date('01/01/2017'),
      },
    };

    var inflows = {
      collapsed: false,
      name     : 'inflows',
      title    : 'Inflows',
      type     : 'section',
      children : _getInflows(),
      guid     : Utilities.guid(),
      tally    : tally,
    };

    return [
      inflows,
    ];
  }

  function _getInflows(){
    var mattAlerus = {
      type    : 'lineItem',
      title   : 'matt - alerus',
      name    : 'mattAlerus',
      guid    : Utilities.guid(),
      seedData: {
        seedDataType: 'periodicDates',
        payment     : {
          startDate        : null,
          startAmount      : 26000,
          numDaysInInterval: 30,
        }
      }
    };

    var mattFidelity = {
      type    : 'lineItem',
      title   : 'matt - fidelity',
      name    : 'mattFidelity',
      guid    : Utilities.guid(),
      seedData: {
        seedDataType: 'periodicDates',
        payment     : {
          startDate        : null,
          startAmount      : 46000,
          numDaysInInterval: 30,
        }
      }
    };

    var penFidelity = {
      type    : 'lineItem',
      title   : 'pen - fidelity',
      name    : 'penFidelity',
      guid    : Utilities.guid(),
      seedData: {
        seedDataType: 'periodicDates',
        payment     : {
          startDate        : null,
          startAmount      : 46000,
          numDaysInInterval: 30,
        }
      }
    };


    return [
      mattAlerus,
      mattFidelity,
      penFidelity,
    ];
  }

}
