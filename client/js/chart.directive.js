angular.module('app')
  .directive('moneyChart', [ChartController]);

function ChartController() {
  return {
    scoperestrict    : 'E',
    templateUrl : 'views/chart.template.html',
    scope: {
      chartobject: '=',
      parent     : '=',
    },    
    controller  : [
      'Api',
      'Chart',
      'DataBase',
      '$scope',
      '$q',
      'Utilities',
      'Table',
      'ngDialog',
      'Constants',
      ChartCtrl
    ],
    controllerAs: 'moneychart',
  };
}

function ChartCtrl(
  Api,
  Chart,
  DataBase,
  $scope,
  $q,
  Utilities,
  Table,
  ngDialog,
  Constants
  ) { 
  
  var vm = this;
  init();

  $scope.$on('someEvent', function(event, mass) {
    drawChart(vm.chartId);
  });

  ///////////////////////////////////////////// Get Data /////////////////////////////////////

  function init() {
    vm.landingPage = $scope.parent;
    vm.chartobject = $scope.chartobject;
    vm.chartId     = 'chart-div' + vm.chartobject.guid
    vm.test        = 'fuck you you fucking fuck';

    console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
    console.log('chartobject: ');
    console.log(vm.chartobject);
    console.log('|------------------------------------------------------------------------------------------------|')
    
    
  }

  function drawChart(elementId) {
    vm.tableMatrix = Constants.scenarios[1].tableMatrix;
    // If the chart is empty, add the top level row from each active scenario.
    if (Chart.series.length < 2) {
      var rowsToGraph = vm.tableMatrix.filter(row=> row.nestLevel === 2);
      Chart.series.push(Utilities.getLast(rowsToGraph));
    }

    Chart.drawChart(elementId);
  }


}

