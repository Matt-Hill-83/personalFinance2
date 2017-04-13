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
  vm.addStudy             = addStudy;
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
  ];

  vm.studyToCreate = vm.studyTemplates[0];
  vm.showCharts    = true;
  vm.editingStudy  = false;

  var noStudyMessage = {
    guid   : 0,
    message: 'no studies loaded - please clone one',
    name   : 'no studies loaded - please clone one',
  };

  getStudys(newPageLoad=true);

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
    .then(resp=> {
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

  function addStudy(study, incrementName) {
    return Api.newStudy(study.guid)
    .then(resp=> {
      var returnedStudy = resp.data;
      // var name = vm.activeStudy ? vm.activeStudy.name : study.name;
      
      if (incrementName) {
        returnedStudy.name = returnedStudy.name + '  [new]';
      }
      return Api.updateStudy(returnedStudy);
    })
    .then(refreshData)
    .then(resp=> {
      vm.activeStudy = Utilities.getLast(vm.studys);
      rebind();
    });
  }

  function rebind() {
    Constants.activeStudy = vm.activeStudy;
    vm.scenarios          = vm.activeStudy.scenarios;
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

  function getStudys(newPageLoad){
    return Api.getStudys()
    .then(resp=> {
      if (resp.data.length > 0) {
        vm.studys = Api.sanitizeStudys(resp.data);

        console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
        console.log('newPageLoad: ');
        console.log(newPageLoad);
        console.log('|------------------------------------------------------------------------------------------------|')
        
      // If there are no studes and the user refreshed the page, create some studies for them.
      } else if (newPageLoad) {
        vm.studys = [];
        // return addStudy(vm.studyTemplates[0])
        return addStudy(vm.studyTemplates[2])
        // .then(()=>{
        //   return addStudy(vm.studyTemplates[0])
          .then(()=> {
            newPageLoad = false;
          });
        // });
      } else {
        // no studies were returned, 
        vm.studys = [noStudyMessage];
        vm.activeStudy = vm.studys[0];
      }
    })
    .then(()=> {
      return getScenarios();
    })
    .then(()=> {
      formatStudies(vm.studys);
      vm.activeStudy = vm.studys[0];
      rebind();

      // Not yet implemented
      vm.studyDescription   = $filter('html')(vm.activeStudy.description);
    });
  }

}

