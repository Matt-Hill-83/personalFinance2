"use strict"
angular.module('app').factory('Api', [
  '$http',
  '$window',
  'Utilities',
  ApiController]);

function ApiController(
  $http,
  $window,
  Utilities
  ){
  var service = {
    createRow,
    deleteRow,
    updateRow,
    getBlocks,

    addSection,

    getStudys,
    updateStudy,
    newStudy,
    deleteStudy,
    sanitizeStudys,

    getScenarios,
    deleteScenario,
    createScenario,
    
    dropDb,

    deleteChart,
    addChart,
    updateChart,
    sanitizeChart,

    getRules,
    updateRule,
    deleteRule,
    addRule,

    sanitizeBlocks,
    sanitizeObjects,
    sanitizeRules,

  };

  return service;

  /////////////////////////  drop db /////////////////////////////

  function dropDb(data) {
    return $http.delete('/tables', data)
    // .success((data) => {})
    .success((data) => {$window.location.reload()})
    .error((error) => {console.log('Error: ' + error)});
  }

  /////////////////////////  charts /////////////////////////////

  function deleteChart(chartGuid) {
    return $http.delete('/chart/' + chartGuid)
    .success((data) => {})
    .error((error) => {console.log('Error: ' + error)});
  }
  
  function addChart(data) {
    return $http.post('/charts', {data: data})
    .success((data) => {})
    .error((error) => {console.log('Error: ' + error)});
  }

  function updateChart(data) {
    return $http.put('/chart', {data: data})
    .success((data) => {})
    .error((error) => {console.log('Error: ' + error)});
  }

  /////////////////////////  scenarios /////////////////////////////
  
  function getScenarios() {
    return $http.get('/scenarios')
    .success((data) => {})
    .error((error) => {console.log('Error: ' + error)});
  }

  function createScenario(studyGuid) {
    return $http.post('/scenario', {data: {studyGuid: studyGuid}})
    .success((data) => {})
    .error((error) => {console.log('Error: ' + error)});
  }

  function deleteScenario(scenarioGuid) {
    return $http.delete('/scenario/' + scenarioGuid)
    .success((data) => {})
    .error((error) => {console.log('Error: ' + error)});
  }

  /////////////////////////  rules /////////////////////////////

  function getRules() {
    return $http.get('/rules')
    .success((data) => {})
    .error((error) => {console.log('Error: ' + error)});
  }

  function addRule(payload) {
    return $http.post('/rules', payload)
    .success((data) => {})
    .error((error) => {console.log('Error: ' + error)});
  }

  function updateRule(payload) {
    var updatePromise = $http.put('/rule/', payload)
    .success((data) => {})
    .error((error) => {console.log('Error: ' + error)});
    return updatePromise;
  }

  function deleteRule(ruleId) {
    return $http.delete('/rule/' + ruleId)
    .success((data) => {console.log('deleted rule')})
    .error((error) => {console.log('Error: ' + error)});
  }

  /////////////////////////  studys /////////////////////////////

  function deleteStudy(studyId) {
    return $http.delete('/studys/' + studyId)
    .success((data) => {console.log('deleted study')})
    .error((error) => {console.log('Error: ' + error)});
  }

  function newStudy(studyGuid) {
    return $http.get('/newStudy/' + studyGuid)
    .success((data) => {})
    .error((error) => {console.log('Error: ' + error)});
  }

  function getStudys() {
    return $http.get('/studys')
    .success((data) => {})
    .error((error) => {console.log('Error: ' + error)});
  }

  function updateStudy(data) {
    return $http.put('/study', data)
    .success((data) => {})
    .error((error) => {console.log('Error: ' + error)});
  }

  /////////////////////////  blocks /////////////////////////////

  function deleteRow(rowId) {
    return $http.delete('/blocks/' + rowId)
    .success((data) => {console.log('deleted row')})
    .error((error) => {console.log('Error: ' + error)});
  }

  function updateRow(payload) {
    return $http.put('/blocks/', payload)
    .success((data) => {})
    .error((error) => {console.log('Error: ' + error)});
  }

  function createRow(newSection) {
    return $http.post('/addRow', {data: newSection})
    .success((data) => {})
    .error((error) => {console.log('Error: ' + error)});
  }
  
  function getBlocks(scenarioId) {
    return $http.get('/blocks/' + scenarioId)
    .success(blocks => {
      return sanitizeBlocks(blocks);
    })
    .error((error) => {console.log('Error: ' + error)});
  }

  ////////////////////// sections //////////////////////////////

  function addSection(data) {
    return $http.post('/addSection', {data: data})
    .success((data) => {})
    .error((error) => {console.log('Error: ' + error)});
  }

  ////////////////////// sanitize //////////////////////////////

  function sanitizeBlocks(newBlocks) {
    newBlocks.forEach(block=> {
      block.guid              = parseInt(block.id);
      block.parentGuid        = parseInt(block.parentGuid);
      block.indexWithinParent = parseInt(block.indexWithinParent);
      block.scenario          = parseInt(block.scenario);

      if (
        block.type === 'lineItem' &&
        block.seedData &&
        block.seedData.seedDataJoinPayment
        ) {
        block.seedData.numPayments         = parseInt(block.seedData.numPayments);
        block.seedData.initialPayment      = block.seedData.seedDataJoinPayment.seedPayment;
        block.seedData.initialPayment.date = new Date(block.seedData.initialPayment.date);
        block.seedData.seedDataJoinPayment = 'removed from object to avoid confusion';
      
        if (block.seedData.numDaysInInterval) {
          block.seedData.numDaysInInterval = parseInt(block.seedData.numDaysInInterval);
        }
      }

      if (block.tally) {
        block.tally.tallyPayment.date = new Date(block.tally.tallyPayment.date);

        var tz = block.tally.tallyPayment.date.getTimezoneOffset();

        console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
        console.log('tz: ');
        console.log(tz);
        console.log('|------------------------------------------------------------------------------------------------|')

        console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
        console.log('block.tally.tallyPayment.date: ');
        console.log(block.tally.tallyPayment.date);
        console.log('|------------------------------------------------------------------------------------------------|')
        
        var year  = block.tally.tallyPayment.date.getFullYear();
        var month = block.tally.tallyPayment.date.getMonth();
        var day   = block.tally.tallyPayment.date.getDay();


        console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
        console.log('year: ');
        console.log(year);
        console.log('|------------------------------------------------------------------------------------------------|')
        

        console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
        console.log('month: ');
        console.log(month);
        console.log('|------------------------------------------------------------------------------------------------|')
        
        
        console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
        console.log('day: ');
        console.log(day);
        console.log('|------------------------------------------------------------------------------------------------|')
        
        

        var test = new Date(year, month, day);        
        

        console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
        console.log('block.tally.tallyPayment.date: ');
        console.log(block.tally.tallyPayment.date);
        console.log('|------------------------------------------------------------------------------------------------|')
        


        console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
        console.log('test: ');
        console.log(test);
        console.log('|------------------------------------------------------------------------------------------------|')
        
        

      }

    });

    return newBlocks;
  }  
  
  function sanitizeRules(newRules) {
    var propertiesToIntergerize = [
      'scenario',
      'destinationGuid',
      'destinationMaxAmount',
      'indexWithinParent',
      'inflowLineItemGuid',
      'outflowLineItemGuid',
      'sourceGuid',
      'sourceMinAmount',
    ];

    newRules = Utilities.sortSections(newRules);
    newRules = newRules.map(oldObject=> {
      return removeCreatedAt(oldObject);
    });

    newRules.forEach(oldObject=> {
      propertiesToIntergerize.forEach(prop=> {
        if (oldObject[prop]) {
          oldObject[prop] = parseInt(oldObject[prop]);
        }
      });
    });
    return newRules;
  }  

  // Pick out desired params from returned object and ignore undesired params.
  // TODO, rewrite so that it keeps everything but the data params.
  function removeCreatedAt(oldObject) {
    var paramsToRemove = [
      'createdAt',
      'modifiedAt',
      'updatedAt',
      // 'id',
    ];

    var newObject = {guid: parseInt(oldObject.id)};
    for (var property in oldObject) {
      if (Utilities.arrayDoesNotInclude(paramsToRemove, property)) {
        newObject[property] = oldObject[property];
      }
    }
    return newObject;
  }

  function sanitizeStudys(studys) {
    return studys.map(study=> {
      var newStudy       = removeCreatedAt(study);
      var oldScenarios   = study.studyJoinScenarios.map(join=> join.scenario);
      newStudy.scenarios = oldScenarios.map(el=> removeCreatedAt(el));

      newStudy.charts = newStudy.charts.map(chart=> {
        return sanitizeChart(chart);
      });
      newStudy.charts = Utilities.sortSections(newStudy.charts);

      return newStudy;
    });
  }  

  function sanitizeChart(chart) {
    chart.indexWithinParent = parseInt(chart.indexWithinParent);
    chart.lineItemGuids     = JSON.parse(chart.lineItemGuids);
    chart                   = sanitizeObject(chart);
    return chart;
  }

  function sanitizeObjects(oldObjects) {
    return oldObjects.map(oldObject=> {
      return removeCreatedAt(oldObject);
    });
  }  

  function sanitizeObject(oldObject) {
    return removeCreatedAt(oldObject);
  }  


}
