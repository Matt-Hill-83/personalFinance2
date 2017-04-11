angular.module('app')
  .directive('landingPage', [landingPageController]);

function landingPageController(Table, Constants) {
  return {
    restrict   : 'E',
    templateUrl: 'views/landingPage.html',
    controller : [
      'Api',
      'Chart',
      'Constants',
      'DataBase',
      '$filter',
      '$rootScope',
      '$scope',
      '$q',
      '$http',
      'Utilities',
      'Table',
      LandingPageController
    ],
    controllerAs: 'landingPage',
  };
}

function LandingPageController(
  Api,
  Chart,
  Constants,
  DataBase,
  $filter,
  $rootScope,
  $scope,
  $q,
  $http,
  Utilities,
  Table
  ) { 
  
  vm = this;
  vm.studys;
  vm.scenarios;
  
  vm.dropDb               = dropDb;
  vm.refreshData          = refreshData;
  vm.newStudy             = newStudy;
  vm.deleteStudy          = deleteStudy;
  vm.updateStudy          = updateStudy;
  vm.editStudy            = editStudy;
  vm.editStudyFinsihed    = editStudyFinsihed;
  vm.selectDifferentStudy = selectDifferentStudy;
  vm.refreshCharts        = refreshCharts;
  vm.refreshTables        = refreshTables;
  vm.logStudy             = logStudy;

  vm.studyTemplates = [
    {
      guid: 1,
      name: 'Is grad school worth it?',
    },
    {
      guid: 2,
      name: 'camry vs. prius',
    },
    {
      guid: 3,
      name: 'Pay student loan or max out 401k?',
    },
  ]
  vm.studyToCreate = vm.studyTemplates[0];
  var myNewStudy = vm.studyTemplates[0];

  vm.showCharts   = true;
  vm.editingStudy = false;

  getStudys(0);
  getScenarios();

  var noStudyMessage = {
    guid: 0,
    message: 'no studies available',
  };

  ////////////////////////////////////////////////////// Charts /////////////////////////////////

  function logStudy(study) {
    console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
    console.log('activeStudy: ');
    console.log(vm.activeStudy);
    console.log('|------------------------------------------------------------------------------------------------|')
  }

  function refreshCharts() {
    // Hacky workaround to force data binding to work
    vm.showCharts = true;
  }

  function refreshTables() {
    // Hacky workaround to force data binding to work
    vm.showTables = true;
    vm.showCharts = false;
  }

  ////////////////////////////////////////////////////// Charts /////////////////////////////////

  function dropDb(study){
    return Api.dropDb({data: 'zippy'})
  }

  function getScenarios() {
    return Api.getScenarios()
    .then((resp) => {
      Constants.allScenarios = Api.sanitizeObjects(resp.data);
    });
  }

  function deleteStudy(study){
    Api.deleteStudy(study.guid)
    .then(refreshData);    
  }

  function editStudy(study){
    vm.editingStudy = true;
    vm.logStudy(study);
  }

  function editStudyFinsihed(study){
    vm.editingStudy = false;
    updateStudy(study);
  }

  function updateStudy(study){

    console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
    console.log('study: ');
    console.log(study);
    console.log('|------------------------------------------------------------------------------------------------|')
    
    
  }

  function selectDifferentStudy(studyFromPicker) {
    
    
    if (vm.activeStudy) {
      vm.scenarios          = vm.activeStudy.scenarios;
      vm.showTables         = false;
      Constants.activeStudy = vm.activeStudy;
    }
    
  }

  function newStudy(study) {
    return Api.newStudy(study.guid)
    .then(resp=> {
      returnedStudy = resp.data;
      var name = vm.activeStudy ? vm.activeStudy.name : study.name;
      
      returnedStudy.name = name + '  [copy]';
      return Api.updateStudy(returnedStudy);
    })
    .then(refreshData)
    .then(resp=> {
      vm.activeStudy = Utilities.getLast(vm.studys);
      Constants.activeStudy = vm.activeStudy;
      vm.scenarios = vm.activeStudy.scenarios;
    })
  }

  function rebind() {
    Constants.activeStudy = vm.activeStudy;
    vm.scenarios = vm.activeStudy.scenarios;
  }

  function refreshData() {
    return getStudys()
    .then(resp=> {
      vm.showTables = false;
    })
  }

  function formatStudies() {
    if (vm.studys && vm.studys.length > 0) {
      vm.studys.forEach(study=> {
        study.message = study.name;
      });
    } else {
      vm.studys = [noStudyMessage];
    }
  }

  function getStudys(studyToShow){
    return Api.getStudys()
    .then((resp) => {
      if (resp.data.length > 0) {
        vm.studys = Api.sanitizeStudys(resp.data);
      } else {
        vm.studys = [];
        return newStudy(myNewStudy);
      }
    })
    .then(()=> {
      return getScenarios();
    })
    // .then(()=> {
    //   var promises = Constants.allScenarios.map(scenario=> {
    //     return Api.getBlocks(scenario.guid);
    //   })
    //   return $q.all(promises);
    // })
    .then(()=> {
      formatStudies(vm.studys);
      vm.activeStudy        = vm.studys[0];
      Constants.activeStudy = vm.activeStudy;
      vm.scenarios          = vm.activeStudy.scenarios;

      // Not yet implemented
      vm.studyDescription   = $filter('html')(vm.activeStudy.description);


      // vm.showTables         = false;
    });
  }

}

