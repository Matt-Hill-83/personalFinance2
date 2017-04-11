
angular.module('app').factory('Chart', [
  'DataGeneration',
  'DataBase',
  'Constants',
  'Api',
  'Utilities',
  Main_]);

function Main_(
  DataGeneration,
  DataBase,
  Constants,
  Api,
  Utilities
  ) {
  var series = [];
  var service = {
    deleteChart,
    drawChart,
    updateChart,
    toggleChartActivationStatus,
    activateChart,
    deactivateChart,
    addChart,
    formatRowData,
    toggleRowOnChart,
    series,
  };

  return service;

  ////////////////////////////////////////////////////////////////////////////////////

  function deleteChart(chart) {
    deactivateChart(chart, Constants.activeStudy);

    return Api.deleteChart(chart.guid)
    .then(()=>{
      var index = Constants.activeStudy.charts.indexOf(chart);
      if (index > -1) {
        Constants.activeStudy.charts.splice(index, 1);
      }
    });
  }

  function addChart(data, chart) {
    if (chart) {
      deactivateChart(chart, Constants.activeStudy);
    }

    return Api.addChart(data)
    .then((resp)=>{
      var newChart = Api.sanitizeChart(resp.data);
      newChart.chartDivId = 'chart-div' + newChart.guid;
      Constants.activeStudy.charts.unshift(newChart);
    });
  }

  function toggleRowOnChart(row) {
    row.shownOnActiveChart = !row.shownOnActiveChart;

    if (row.shownOnActiveChart) {    
      Constants.chartData.activeChart.lineItems.push(row);
      Constants.chartData.activeChart.lineItemGuids.push(row.guid);
      // update db object also
    } else {
      var index = Constants.chartData.activeChart.lineItems.indexOf(row);
      if (index > -1) {
        Constants.chartData.activeChart.lineItems.splice(index, 1);
        Constants.chartData.activeChart.lineItemGuids.splice(index, 1);
      }      
    }
    drawChart(Constants.chartData.activeChart);
    return updateChart(Constants.chartData.activeChart);
  }

  function updateChart(chart) {
    var chartParams = {
      name             : chart.name,
      guid             : chart.guid,
      indexWithinParent: chart.indexWithinParent,
      lineItemGuids    : JSON.stringify(chart.lineItemGuids),
      subTitle         : chart.subTitle,
    };
    return Api.updateChart(chartParams);
  }

  function toggleChartActivationStatus(chart, study) {
    // Hide toggles on all lineItems
    DataBase.blockDb.forEach(lineItem=> lineItem.shownOnActiveChart = undefined);

    if (chart.active) {
      deactivateChart(chart, study)      
    } else {
      activateChart(chart, study);      
    }
  }

  function activateChart(chart, study) {
    console.log('activating')
    study.charts.forEach(chart=> chart.active = false);
    chart.active = true;
    Constants.chartData.activeChart = chart;
    chart.lineItems.forEach(lineItem=> lineItem.shownOnActiveChart = chart);
  }

  function deactivateChart(chart, study) {
    console.log('deactivating')
    if (!chart || !study) {
      return;
    }

    study.charts.forEach(chart=> chart.active = false);
    Constants.chartData.activeChart = undefined;
    if (chart.lineItems) {
      chart.lineItems.forEach(lineItem=> lineItem.shownOnActiveChart = undefined);
    }
  }

  ////////////////////////////////// HighCharts //////////////////////////////////////////////////

  function formatRowData(chart) {
    var output = chart.lineItems.map(row=> {
      // This is a somewhat common indicator that something went wrong.
      if (!row.cells) {
        console.log('returning from format');
        return;
      }

      var cells = row.cells.map(cell=> cell.valueToDisplay);
      // chop off first 2 cells.
      cells.splice(0,2);

      var scenario = Constants.activeStudy.scenarios.filter(scenario=> scenario.guid === row.scenario)[0];
      if (!scenario) {
        return;
      }
      
      var newSeries = {
        name: row.name + ' - ' + scenario.name,
        data: cells,
      };
      return newSeries;

    });
    return output;
  }

  function drawChart(chart) {
    console.log('refreshing chart');
    
    // _setTheme();
    var series   = formatRowData(chart);
    var title    = chart.name;
    var subTitle = chart.subTitle;

    chart.lineItems = chart.lineItemGuids.map(guid=> DataBase.lineItems.getBlockFromGuid(guid));
    var dataIsReady = chart.lineItems.every(lineItem=> typeof(lineItem) === 'object');

    // deal with common errors
    if (!dataIsReady || !chart.chartDivId || !series) {
      console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
      console.log('dataIsReady: ');
      console.log(dataIsReady);
      console.log('|------------------------------------------------------------------------------------------------|')
      
      console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
      console.log('chart.chartDivId: ');
      console.log(chart.chartDivId);
      console.log('|------------------------------------------------------------------------------------------------|')
      return;
    }

    if (!series.every(item=> item)) {
      console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
      console.log('series is bad');
      console.log(series);
      console.log('|------------------------------------------------------------------------------------------------|')
      return;
    }

    Highcharts.chart(chart.chartDivId, {
        chart: {
            // height: 250 // this is set by the containing div.
        },
        title: {
            text: title
        },
        subtitle: {
            text: subTitle
        },
        yAxis: {
            title: {
                text: ''
            }
        },
        legend: {
            layout       : 'vertical',
            align        : 'right',
            verticalAlign: 'middle'
        },
        plotOptions: {
            series: {
                pointStart: 2
            }
        },
        series: series,
    });  
  }

  function _setTheme() {
    // Load the fonts
    Highcharts.createElement('link', {
       href: 'https://fonts.googleapis.com/css?family=Signika:400,700',
       rel: 'stylesheet',
       type: 'text/css'
    }, null, document.getElementsByTagName('head')[0]);

    // Add the background image to the container
    Highcharts.wrap(Highcharts.Chart.prototype, 'getContainer', function (proceed) {
       proceed.call(this);
       this.container.style.background = 'url(http://www.highcharts.com/samples/graphics/sand.png)';
    });

    Highcharts.theme = {
       colors: ['#f45b5b', '#8085e9', '#8d4654', '#7798BF', '#aaeeee', '#ff0066', '#eeaaee',
          '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
       chart: {
          backgroundColor: null,
          style: {
             fontFamily: 'Signika, serif'
          }
       },
       title: {
          style: {
             color: 'black',
             fontSize: '16px',
             fontWeight: 'bold'
          }
       },
       subtitle: {
          style: {
             color: 'black'
          }
       },
       tooltip: {
          borderWidth: 0
       },
       legend: {
          itemStyle: {
             fontWeight: 'bold',
             fontSize: '13px'
          }
       },
       xAxis: {
          labels: {
             style: {
                color: '#6e6e70'
             }
          }
       },
       yAxis: {
          labels: {
             style: {
                color: '#6e6e70'
             }
          }
       },
       plotOptions: {
          series: {
             shadow: true
          },
          candlestick: {
             lineColor: '#404048'
          },
          map: {
             shadow: false
          }
       },

       // Highstock specific
       navigator: {
          xAxis: {
             gridLineColor: '#D0D0D8'
          }
       },
       rangeSelector: {
          buttonTheme: {
             fill: 'white',
             stroke: '#C0C0C8',
             'stroke-width': 1,
             states: {
                select: {
                   fill: '#D0D0D8'
                }
             }
          }
       },
       scrollbar: {
          trackBorderColor: '#C0C0C8'
       },

       // General
       background2: '#E0E0E8'

    };

    // Apply the theme
    Highcharts.setOptions(Highcharts.theme);    
  }

}
