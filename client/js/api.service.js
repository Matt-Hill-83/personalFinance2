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
    getBlocks,
    getStudys,
    getRules,
    getScenarios,

    deleteScenario,
    createScenario,
    addSection,
    newStudy,
    deleteStudy,
    
    removeCreatedAt,
    sanitizeBlocks,
    sanitizeStudys,
    sanitizeObjects,
    sanitizeRules,
    updateRow,

    dropDb,

    updateRule,
    deleteRule,
    addRule,
  };

  return service;

  /////////////////////////  drop db /////////////////////////////

  function dropDb(data) {
    return $http.delete('/tables', data)
    .success((data) => {$window.location.reload()})
    .error((error) => {console.log('Error: ' + error)});
  }

  /////////////////////////  scenarios /////////////////////////////
  
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
  
  ////////////////////// sections //////////////////////////////

  function addSection(data) {
    return $http.post('/addSection', {data: data})
    .success((data) => {})
    .error((error) => {console.log('Error: ' + error)});
  }

  ////////////////////// get //////////////////////////////

  function getBlocks(scenarioId) {
    return $http.get('/blocks/' + scenarioId)
    .success((data) => {})
    .error((error) => {console.log('Error: ' + error)});
  }

  function getScenarios() {
    return $http.get('/scenarios')
    .success((data) => {})
    .error((error) => {console.log('Error: ' + error)});

  }

  function getStudys() {
    return $http.get('/studys')
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
      'id',
    ];

    var newObject = {guid: parseInt(oldObject.id)};
    for (var property in oldObject) {
      if (Utilities.arrayDoesNotInclude(paramsToRemove, property)) {
        newObject[property] = oldObject[property];
      }
    }

    return newObject;
  }

  function sanitizeStudys(oldObjects) {
    return oldObjects.map(oldObject=> {
      var newObject       = removeCreatedAt(oldObject);
      var oldScenarios    = oldObject.studyJoinScenarios.map(join=> join.scenario);
      newObject.scenarios = oldScenarios.map(el=> removeCreatedAt(el));

      return newObject;
    });
  }  

  function sanitizeObjects(oldObjects) {
    return oldObjects.map(oldObject=> {
      return removeCreatedAt(oldObject);
    });
  }  


}
