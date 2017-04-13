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
  Utilities,
  Table,
  ngDialog,
  Constants
  ) { 
  
  var vm = this;
  init();

  $scope.$on('tableRebuilt', function(event, data) {
    redrawChart();
  });

  ///////////////////////////////////////////// Get Data /////////////////////////////////////

  function init() {
    // After the html is rendered, it sends a message to the directive to draw the chart,
    // because it needs the div id from the chart.
    vm.chartHasBeenDrawn = false;

    vm.landingPage      = $scope.parent;
    vm.chart            = $scope.chartobject;
    vm.chart.chartDivId = 'chart-div' + vm.chart.guid;
    
    vm.clearChart            = clearChart;
    vm.redrawChart           = redrawChart;
    vm.deleteChart           = deleteChart;
    vm.addChart              = addChart;
    vm.toggleChartActivation = toggleChartActivation;
    vm.study                 = vm.landingPage.activeStudy;
  }

  function redrawChart() {
    addLineItemGuidsToSeedDataCharts(vm.chart);    
    vm.chart.lineItems = vm.chart.lineItemGuids.map(guid=> DataBase.lineItems.getBlockFromGuid(guid));
    var dataIsReady    = vm.chart.lineItems.every(lineItem=> typeof(lineItem) === 'object');

    if(dataIsReady) {
      drawChart(vm.chartId);
      vm.chartHasBeenDrawn = true;
    }
  }

  function addLineItemGuidsToSeedDataCharts(chart) {
    // For seed data, chart traces must be attached to chart object after data has been loaded.
    // The chart definitions are updated and pushed to the db.
    if (chart.lineItemGuids[0] < 0 && DataBase.blockDb.length > 0) {
      var guids = [undefined];

      // Total of buckets graph compares total of buckets lineItem from bothe graphs.
      if (chart.lineItemGuids[0] === -1) {
        var guid1 = getLineItemGuidFromLineItemName('total of BUCKETS', vm.study.scenarios[0].guid);
        var guid2 = getLineItemGuidFromLineItemName('total of BUCKETS', vm.study.scenarios[1].guid);
        var guids = [guid1, guid2];
      }
          
      // Total of buckets graph compares total of buckets lineItem from both graphs.
      if (chart.lineItemGuids[0] === -2) {
        var guid1 = getLineItemGuidFromLineItemName('petty cash', vm.study.scenarios[0].guid);
        var guid2 = getLineItemGuidFromLineItemName('emergency fund', vm.study.scenarios[0].guid);
        var guid3 = getLineItemGuidFromLineItemName('house downpayment', vm.study.scenarios[0].guid);
        var guids = [guid1, guid2, guid3];
      }

      // Total of buckets graph compares total of buckets lineItem from both graphs.
      if (chart.lineItemGuids[0] === -3) {
        var guid1 = getLineItemGuidFromLineItemName('petty cash', vm.study.scenarios[0].guid);
        // var guid2 = getLineItemGuidFromLineItemName('emergency fund', vm.study.scenarios[0].guid);
        var guid3 = getLineItemGuidFromLineItemName('student loan', vm.study.scenarios[0].guid);
        var guids = [guid1, guid3];
      }

      if (guids.every(guid=>guid)) {
        chart.lineItemGuids = guids;
        Chart.updateChart(chart);
      }
    }
  }

  function getLineItemGuidFromLineItemName(name, scenarioGuid) {
    var params = {
      name    : name,
      scenario: scenarioGuid,
    };

    // Test whether data has been loaded.
    var lineItem = DataBase.lineItems.getByParams(params)[0];
    if (lineItem) {
      return lineItem.guid;
    }

    return;
  }

  function clearChart() {
    Utilities.clearArray(vm.chart.lineItemGuids);
    Utilities.clearArray(vm.chart.lineItems);
    Chart.drawChart(vm.chart);
    // Update in database.
    Chart.updateChart(vm.chart);
  }

  function deleteChart() {
    Chart.deleteChart(vm.chart)
    .then(()=> {
      vm.landingPage.showCharts = false;
    });
  }

  function addChart() {
    var data = {
      studyGuid        : vm.study.guid,
      name             : vm.chart.name + '  [copy]',
      subTitle         : vm.chart.subTitle,
      indexWithinParent: vm.chart.indexWithinParent + 1,
      lineItemGuids    : JSON.stringify(vm.chart.lineItemGuids),
    };

    Chart.addChart(data, vm.chart)
    .then(resp=> {
      vm.landingPage.showCharts = false;
    });
  }

  function toggleChartActivation() {
    Chart.toggleChartActivationStatus(vm.chart, vm.study);
  }

  function drawChart() {
    return Chart.drawChart(vm.chart);
  }

}

