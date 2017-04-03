
angular.module('app').factory('Chart', ['DataGeneration', 'DataBase', 'Constants', 'Utilities', Main_]);

function Main_(DataGeneration, DataBase, Constants, Utilities) {
  var series = [];
  var service = {
    deleteRow,
    drawChart,
    formatRowData,
    series,
  };

  return service;

  ////////////////////////////////////////////////////////////////////////////////////

  function deleteRow(rowGuid) {
    var indexOfRowToDelete;
    service.series.forEach((row, index)=> {
      if (row.guid === rowGuid) {
        indexOfRowToDelete = index;
        return;
      }            

    });
    service.series.splice(indexOfRowToDelete, 1);
    drawChart();
  }

  function formatRowData() {
    var output = service.series.map(row=> {
      var cells = row.cells.map(cell=> cell.valueToDisplay);
      // chop off first 2 cells.
      var name  = cells.splice(0,2);

      // grab the name from the first cell.
      return {
        name: 'scenario: ' + row.scenario + '--' + name[0],
        data: cells,
      };

    });
    return output;
  }

  function drawChart(elementId) {
    // _setTheme();
    Highcharts.chart(elementId, {

        title: {
            text: 'Cash - Base Case'
        },

        // subtitle: {
        //     text: 'Source: thesolarfoundation.com'
        // },

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

        series: service.formatRowData(),
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
