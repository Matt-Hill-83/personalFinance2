angular.module('app')
  .directive('financeView', [mainTableController]);

function mainTableController() {
  return {
    scoperestrict    : 'E',
    templateUrl : 'views/table.template.html',
    scope: {
      tableobject: '=',
      parent: '=',
    },    
    controller  : [
      'Api',
      'Chart',
      'DataBase',
      '$scope',
      '$rootScope',
      '$q',
      'Utilities',
      'Chart',
      'Table',
      'ngDialog',
      'Constants',
      Ctrl
    ],
    controllerAs: 'maintable',
  };
}

function Ctrl(
  Api,
  Chart,
  DataBase,
  $scope,
  $rootScope,
  $q,
  Utilities,
  Chart,
  Table,
  ngDialog,
  Constants
  ) { 
  
  // attach jQuery datepicker styling to date input
  $(function() {
    $( "#datepicker" ).datepicker({});
  });

  var vm = this;
  init();

  ///////////////////////////////////////////// Get Data /////////////////////////////////////

  function init() {
    vm.initRuleManager = false;
    vm.rulePickerIsVisible = false;
    vm.rulesAreVisible = false;
    vm.fixTheTable     = false;

    vm.chartData = Constants.chartData; // grab the container, so immutable objects can be bound.

    vm.rowThatGotPicked;
    vm.cell;
    vm.row;
    vm.showModal;
    vm.oldRule; // used by ruleManager directive to capture selected rule and fire a callback.

    vm.landingPage = $scope.parent;

    refreshScenarioData($scope.tableobject.guid);

    vm.rowHeaderModalId = 'myModal' + vm.scenarioGuid;
    vm.headerModal      = {};

    vm.fetchRules               = fetchRules;
    vm.fetchRulesAndRedrawTable = fetchRulesAndRedrawTable;
    vm.rebuildDataBaseAndRedraw = rebuildDataBaseAndRedraw;
    
    vm.cloneScenario  = cloneScenario;
    vm.deleteScenario = deleteScenario;

    vm.addSection         = addSection;
    vm.showRules          = showRules;
    vm.showUpdateRowModal = showUpdateRowModal;
    vm.toggleRowOnChart   = toggleRowOnChart;
    vm.redrawTable        = redrawTable;
    vm.logRow             = logRow;
    vm.changeScenario     = changeScenario;
    vm.addRow             = addRow;

    vm.deleteRow           = deleteRow;
    vm.updateRows          = updateRows;
    
    vm.fixTable            = fixTable;
    
    vm.enteredHeader       = enteredHeader;
    vm.exitedTable         = exitedTable;
    vm.exitedModal         = exitedModal;
    vm.changeCollapseState = changeCollapseState;
    
    vm.showPicker          = showPicker;
    vm.pickThisRow         = pickThisRow;

    // vm.rowTypesWithModals  = ['lineItem'];
    vm.rowTypesToHighLight = ['lineItem', 'section', 'tally'];

    vm.$activeHeaderCell;
    vm.$activeRow;

    vm.rowClasses = RowClasses();

    vm.classes = {
      highlightHeaderCell: 'highlightHeaderCell',
      highlightRow       : 'highlightRow',
    };

    vm.paramsForCreateEditModal = {
      addRow,
      updateRows,
      callback   : null,
      headerModal: vm.headerModal,
      newLineItem: null,
      row        : vm.row,
    };

    return fetchData();
  }

  function fetchData() {
    if (!vm.selectedScenario) {
      return;
    }

    return Api.getBlocks(vm.selectedScenario.guid)
    .then(blocks=> {
      Constants.scenarios[vm.selectedScenario.guid].newBlocks = blocks.data;
      fetchRulesAndRedrawTable();
    });
  }

  function refreshScenarioData(scenarioGuid) {
    vm.selectedScenario = Constants.allScenarios.filter(scenario=> scenario.guid === scenarioGuid)[0];
    if (!Constants.scenarios[scenarioGuid]) {
      Constants.scenarios[scenarioGuid] = {};
    }

    if (!Constants.scenarios[scenarioGuid].tableMatrix) {
      Constants.scenarios[scenarioGuid].tableMatrix = [];
    }
    vm.tableMatrix = Constants.scenarios[scenarioGuid].tableMatrix;
    vm.tableConfig = Constants.tableConfig; // Does this exist yet?
    if (vm.selectedScenario) {
      vm.scenarioGuid = vm.selectedScenario.guid;
    }
  }                                                              

  function fetchRules() {
    return Api.getRules()
    .then(resp=> {
      Constants.rules = Api.sanitizeRules(resp.data);
    });
  }

  function fetchRulesAndRedrawTable() {
    vm.initRuleManager = false;
    return Api.getRules()
    .then(resp=> {
      Constants.rules = Api.sanitizeRules(resp.data);
      rebuildDataBaseAndRedraw();
      vm.initRuleManager = true;
    });
  }

  ///////////////////////////////////////////// Clone Scenario /////////////////////////////////

  function cloneScenario() {
    DataBase.cloneScenario(vm.scenarioGuid, vm.landingPage.activeStudy.guid)
    .then(vm.landingPage.refreshData)    
  }

  function deleteScenario() {
    DataBase.deleteScenario(vm.scenarioGuid)
    .then(resp=> {
      // Remove any charts that reference the scenario to be deleted from the parent study.
      // TODO: also make this change in the database.
      var chartsWithoutDeletedScenario = Constants.activeStudy.charts.filter(chart=> {
        if (!chart.lineItems) {
          Chart.deleteChart(chart);
          return;  
        }

        var goodCharts =  chart.lineItems.every(lineItem=> {
          var chartIsGood = lineItem.scenario !== vm.scenarioGuid;
          if (!chartIsGood) {
            Chart.deleteChart(chart);
          }
          return chartIsGood;
        });
        return goodCharts;
      });

      Constants.activeStudy.charts = chartsWithoutDeletedScenario;  
      
    })
    .then(resp=> {
      vm.landingPage.refreshData();
    });
  }

  ///////////////////////////////////////////// Process Data /////////////////////////////////

  function rebuildDataBaseAndRedraw(){
    DataBase.rebuildLocalDataBase(vm.scenarioGuid);
    Table.redrawTable(vm.scenarioGuid);

    // Hacky fix to refresh table styling.
    vm.tableMatrix = [];
    vm.fixTheTable = true;
  }

  function incrementIndexWithinParentForSiblings(validSiblings) {
    return updateRows(validSiblings);
  }

  ///////////////////////////////////////////// Modify Data /////////////////////////////////

  function addRow(lineItem) {
    var parentGuid;
    var indexWithinParent;

    // TODO: make this not depend on vm.row, but instead pass a reference.
    if (vm.row.type === 'lineItem') {
      parentGuid        = vm.row.parentGuid;
      indexWithinParent = vm.row.indexWithinParent + 1;
    } else if (vm.row.type === 'section'){
      parentGuid        = vm.row.guid;
      indexWithinParent = 0;
    }
    
    lineItem.indexWithinParent = indexWithinParent;
    lineItem.parentGuid        = parentGuid;

    return incrementSiblings(lineItem)
    .then(resp=>Api.createRow(lineItem))
    .then(resp=>fetchData())
    .then(resp=>{
    });
  }

  function updateRows(lineItems) {
    var promises = lineItems.map(lineItem=> {
      var payload = {
        data                 : lineItem,
        blockChanged         : true,
        seedDataChanged      : true,
        initialPaymentChanged: true,
      };

      return Api.updateRow(payload)
      .then(rebuildDataBaseAndRedraw);
    });

    return $q.all(promises).then(resp=> {
      // fetchData();
    })
    .then(()=>{
    });
  }    

  function addSection(lineItem) {
    var parentGuid;
    var indexWithinParent;

    if (lineItem.type === 'lineItem') {
      parentGuid        = lineItem.parentGuid;
      indexWithinParent = lineItem.indexWithinParent + 1;
    } else if (lineItem.type === 'section') {
      parentGuid        = lineItem.guid;
      indexWithinParent = 0;
    }

    var newSection = {
      parentGuid       : parentGuid,
      scenario         : lineItem.scenario,
      indexWithinParent: indexWithinParent,
    };

    return incrementSiblings(newSection)
    .then(resp=>Api.addSection(newSection))
    .then(resp=>fetchData())
    .then(resp=>{
    });
  }

  function incrementSiblings(lineItem) {
    var siblings      = DataBase.lineItems.getSiblings(lineItem);
    var validSiblings = siblings.filter(sibling=> {
      var siblingIsValid = sibling.indexWithinParent >= lineItem.indexWithinParent;
      if (siblingIsValid) {
        sibling.indexWithinParent += 1;
      }
      return siblingIsValid;
    });

    if (validSiblings.length > 0) {
      return incrementIndexWithinParentForSiblings(validSiblings);
    } else {
      return $q.resolve( 'no siblings to update' );
    }
  }

  function deleteRow() {
    return Api.deleteRow(vm.row.id).then(
      ()=>fetchData(),
      ()=> {console.log('fail')}
    );
  }

  ///////////////////////////////////////////// Refresh GUI /////////////////////////////////

  function fixTable() {
    // This is a hacky work around because when the new data is pushed to the table, the styling of the table rows
    // is not being updated.
    vm.tableMatrix = Constants.scenarios[vm.scenarioGuid].tableMatrix;
    vm.fixTheTable = false;
  }

  function changeScenario() {
    // TODO: does this trigger on the initial load?
    console.log('changing scenario');

    refreshScenarioData(vm.selectedScenario.guid);
    fetchData()
    .then(rebuildDataBaseAndRedraw);
  }

  function redrawTable() {
    Constants.refreshTableConfig();
    Table.redrawTable(vm.scenarioGuid);
  }

  function changeCollapseState(row) {
    if (row.type === 'section' && row.collapsed) {
      Table.expandSection(row);
    } else if (row.type === 'section' && !row.collapsed) {
      Table.collapseSection(row);
    }
  }

  function logRow() {
    console.log('|------------------------------------------------------------------------------------------------|')
    console.log('lineItem: ');
    console.log(vm.row);
    console.log('classes: ');
    console.log(vm.row.classes);
    console.log('|------------------------------------------------------------------------------------------------|')
  }

  function toggleRowOnChart(row) {
    return Chart.toggleRowOnChart(row);
  }

  ///////////////////////////////////////////// Deal with Rules Directive /////////////////////////////////

  function showRules() {
    vm.rulesAreVisible = !vm.rulesAreVisible;
  }

  function showPicker() {
    vm.rulePickerIsVisible = true;
  }

  function pickThisRow(row) {
    vm.oldRule.callBack(row.guid);
    vm.rulePickerIsVisible = false;
  }

  function showUpdateRowModal(mode) {
    vm.paramsForCreateEditModal.callback = createOrUpdateModalCallback;
    vm.paramsForCreateEditModal.row      = vm.row;
    vm.paramsForCreateEditModal.mode     = mode;
    vm.paramsForCreateEditModal.ngDialog = ngDialog; // pass ngDialog to the modal

    ngDialog.open(
      {
        showClose      : false,
        closeByDocument: true,
        closeByEscape  : true,
        appendTo       : false,
        template       : 'views/test.html',
        className      : 'ngdialog-theme-default',
        scope          : $scope,
      }
    );
  }

  function createOrUpdateModalCallback(data) {
    var promise;
    if (data.update) {

      // TODO, pass the actual value, since vm.row can change when the mouse moves
      promise = updateRows([data.lineItem]);
    } else if (data.create) {
      promise = addRow(data.newLineItem);
    }
    
    return promise;
  }
  //////////////////////////////////////////// Row Highlighting //////////////////////////////

  function exitedTable() {
    vm.rowClasses.deactivate();
  }

  function enteredHeader(event, rowIndex, colIndex, row, cell) {
    vm.cell            = cell;
    vm.row             = row;
    var rowHeaderModal = document.getElementById(vm.rowHeaderModalId);

    // Clear the row highlighting of the row you left when you enter a new row.
    vm.rowClasses.deactivate();

    var cellElement      = event.target;
    var rowElement       = event.target.parentElement;
    vm.$activeHeaderCell = $(cellElement);
    vm.$activeRow        = $(rowElement);

    // Apply hightlight class
    if (vm.rowTypesToHighLight.indexOf(row.type) !== -1) {
      console.log('activating');
      
      vm.rowClasses.activate();
    }
    
    // Show modal.
    // if (row.type &&
    //     vm.rowTypesWithModals.indexOf(row.type) !== -1) {
    //   vm.showModal = true;

    //   var bodyRect = document.body.getBoundingClientRect();
    //   var elemRect = cellElement.getBoundingClientRect();
    //   var offset   = elemRect.top - bodyRect.top;

    //   // vm.headerModal.newX = 0;        
    //   // vm.headerModal.newY = offset + 6;

    //   // rowHeaderModal.style.left = vm.headerModal.newX + "px";
    //   // rowHeaderModal.style.top  = vm.headerModal.newY + "px";
    // } else {
    //   vm.showModal = false;
    // }
  }

  ///////////////////////////////////////////// Old Stuff /////////////////////////////////

  function exitedModal() {
    vm.rowClasses.deactivate();
  }

  function RowClasses(){
    return {
      activate,
      deactivate,
    };

    function activate(){
      // vm.$activeHeaderCell.addClass(vm.classes.highlightHeaderCell);
      vm.$activeRow.addClass(vm.classes.highlightRow);
    }
    
    function deactivate(){
      if (vm.$activeHeaderCell && vm.$activeHeaderCell.hasClass(vm.classes.highlightHeaderCell) ) {
        vm.$activeHeaderCell.removeClass(vm.classes.highlightHeaderCell);
      }
  
      if (vm.$activeRow) {
        vm.$activeRow.removeClass(vm.classes.highlightRow);
      }
    }

  }

}

