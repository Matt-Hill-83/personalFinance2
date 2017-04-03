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
      '$rootScope',
      '$scope',
      '$http',
      'Utilities',
      'Table',
      'Constants',
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
  $rootScope,
  $scope,
  $http,
  Utilities,
  Table,
  Constants
  ) { 
  
  vm = this;
  vm.studys;
  vm.scenarios;
  
  vm.dropDb      = dropDb;
  vm.refreshData = refreshData;
  vm.newStudy    = newStudy;
  vm.deleteStudy = deleteStudy;
  vm.editStudy   = editStudy;
  vm.editStudys  = editStudys;
  vm.cloneStudy  = cloneStudy;

  vm.studyTemplates = [
    {
      guid: 1,
      name: 'household',
    },
    {
      guid: 2,
      name: 'new car loan',
    },
  ]
  vm.studyToCreate = vm.studyTemplates[0];

  var testChart1 = {
    guid     : 1,
    name     : 'mouse',
    study    : 6,
    lineItems: [1,2],
  };

  var testChart2 = {
    guid     : 2,
    name     : 'mouse',
    study    : 6,
    lineItems: [1,2],
  };

  var charts = [testChart1, testChart2];

  vm.selectDifferentStudy = selectDifferentStudy;
  vm.refreshTemplate      = refreshTemplate;
  vm.show                 = true;
  vm.constantsTableHeader = ['name', 'value', 'units   .'];
  vm.constants = [
    {
      name : 'car purchase date',
      value: '01-01-2017',
      units: '',
      guid : 1,
    },
    {
      name : 'car purchase amount',
      value: 30000,
      units: '$',
      guid : 2,
    },
    {
      name : 'car purchase interest rate',
      value: 3.5,
      units: 'pct',
      guid : 2,
    },
  ];

  getStudys(0);
  getScenarios();

  ////////////////////////

  var noStudyMessage = {
    guid: 0,
    message: 'no studies available',
  };

  function dropDb(study){
    var test = Api.dropDb({data: 'zippy'})
    .then(refreshData);    
  }

  function getScenarios() {
    // Get a list of all saved scenarios, that the user can combine into more studys.
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
  }

  function editStudys(){
  }

  function cloneStudy(study){
  }

  function refreshTemplate() {
    // Hacky workaround to force data binding to work
    vm.show = true;
  }

  function selectDifferentStudy() {
    // Hacky workaround to force data binding to work
    vm.show = false;
  }

  function newStudy(study) {
    Api.newStudy(study.guid)
    .then(refreshData);
  }

  function refreshData(loadedStudy=null) {
    getStudys();
    getScenarios()
    .then(()=> {
      if (loadedStudy) {
        // vm.initialStudy = vm.studys[loadedStudy];
      }
      selectDifferentStudy();

    });      
  }

  function formatStudies() {
    if (vm.studys && vm.studys.length > 0) {
      vm.studys.forEach(study=> {
        var user      = study.user ? ' {' + study.user + '}' : '';
        study.message = '[#' + study.guid + ']     ' + study.name + user
        study.charts = charts;
      });
    } else {
      vm.studys = [noStudyMessage];
    }
    vm.initialStudy = vm.studys[0];
  }

  function getStudys(studyToShow){
    Api.getStudys()
    .then((resp) => {
      if (resp.data.length > 0) {
        vm.studys = Api.sanitizeStudys(resp.data);
      } else {
        vm.studys = [];
      }
      
      formatStudies(vm.studys);
      
      // vm.initialStudy = vm.studys[vm.studys.length -1];
      vm.scenarios    = vm.initialStudy.scenarios;
    });
  }


}

