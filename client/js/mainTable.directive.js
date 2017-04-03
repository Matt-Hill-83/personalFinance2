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
  Table,
  ngDialog,
  Constants
  ) { 
  
  // attach jQuery datepicker styling to date input
  $(function() {
    $( "#datepicker" ).datepicker({});
  });

  var vm = this;
  init()
  // .then(()=> $rootScope.$broadcast('someEvent', [1,2,3]))

  ///////////////////////////////////////////// Get Data /////////////////////////////////////

  function init() {
    vm.showRowDefinitionModal = {value: false};
    vm.initRuleManager        = false;
    vm.pickerIsVisible        = false;
    vm.rulesAreVisible        = false;
    vm.fixTheTable            = false;

    vm.rowThatGotPicked;
    vm.cell;
    vm.row;
    vm.showModal;
    vm.oldRule; // used by ruleManager directive to capture selected rule and fire a callback.

    vm.scenarios   = Constants.allScenarios;
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
    vm.clearChart         = clearChart;
    vm.toggleRowOnChart   = toggleRowOnChart;
    vm.redrawTable        = redrawTable;
    vm.logRow             = logRow;
    vm.changeScenario     = changeScenario;
    vm.addRow             = addRow;

    vm.deleteRow           = deleteRow;
    vm.updateRows          = updateRows;
    
    vm.fixTable            = fixTable;
    
    vm.enteredHeader       = enteredHeader;
    vm.exitedModal         = exitedModal;
    vm.changeCollapseState = changeCollapseState;
    
    vm.showPicker          = showPicker;
    vm.pickThisRow         = pickThisRow;

    vm.rowTypesWithModals  = ['lineItem'];
    vm.rowTypesToHighLight = ['lineItem', 'section', 'tally'];

    vm.$activeHeaderCell;
    vm.$activeRow;

    vm.rowClasses = RowClasses();

    vm.classes = {
      hightlightHeaderCell: 'hightlightHeaderCell',
      hightlightRow       : 'hightlightRow',
    };

    vm.paramsForCreateEditModal = {
      addRow,
      updateRows,
      callback              : null,
      headerModal           : vm.headerModal,
      newLineItem           : null,
      row                   : vm.row,
      showRowDefinitionModal: vm.showRowDefinitionModal    
    };

    return fetchData();
  }

  function fetchData() {
    if (!vm.selectedScenario) {
      return;
    }

    return Api.getBlocks(vm.selectedScenario.guid)
    .then((resp)=> {
      Constants.scenarios[vm.selectedScenario.guid].newBlocks = Api.sanitizeBlocks(resp.data);
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
    vm.tableMatrix  = Constants.scenarios[scenarioGuid].tableMatrix;
    vm.tableConfig  = Constants.tableConfig; // Does this exist yet?
    if (vm.selectedScenario) {
      vm.scenarioGuid = vm.selectedScenario.guid;
    }
  }                                                              

  function fetchRules() {
    return Api.getRules()
    .then((resp)=> {
      Constants.rules = Api.sanitizeRules(resp.data);
    });
  }

  function fetchRulesAndRedrawTable() {
    vm.initRuleManager = false;
    return Api.getRules()
    .then((resp)=> {
      Constants.rules = Api.sanitizeRules(resp.data);
      rebuildDataBaseAndRedraw();
      vm.initRuleManager = true;
    });
  }

  ///////////////////////////////////////////// Clone Scenario /////////////////////////////////

  function cloneScenario() {
    DataBase.cloneScenario(vm.scenarioGuid, vm.landingPage.initialStudy.guid)
    // .then(fetchData);
    .then(vm.landingPage.refreshData)    
  }

  function deleteScenario() {
    DataBase.deleteScenario(vm.scenarioGuid)
    .then(vm.landingPage.refreshData);
  }

  ///////////////////////////////////////////// Process Data /////////////////////////////////

  function rebuildDataBaseAndRedraw(){
    DataBase.rebuildLocalDataBase(vm.scenarioGuid);
    Table.redrawTable(vm.scenarioGuid);

    // If the chart is empty, add the top level row from each active scenario.
    if (Chart.series.length < 2) {
      var rowsToGraph = vm.tableMatrix.filter(row=> row.nestLevel === 1);
      Chart.series.push(Utilities.getLast(rowsToGraph));
    }

    // Chart.drawChart();

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
      vm.showRowDefinitionModal.value = false;
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
      vm.showRowDefinitionModal.value = false;
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
      vm.showRowDefinitionModal.value = false;
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
    // Delete row from db.
    Api.deleteRow(vm.row.id).then(
      ()=>fetchData(),
      ()=> {console.log('fail')}
    );
  }

  ///////////////////////////////////////////// Refresh GUI /////////////////////////////////

  // This is a hacky workaround to the fact that I can't delete some rows on chart.
  function clearChart() {
    Utilities.clearArray(Chart.series);
    Chart.drawChart();
  }

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
    console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
    console.log('vm.row: ');
    console.log(vm.row);
    console.log(vm.row.classes);
    console.log('|------------------------------------------------------------------------------------------------|')
  }

  function toggleRowOnChart(row) {
    row.showOnChart = !row.showOnChart;

    if (row.showOnChart) {    
      Chart.series.push(row);
    } else {
      Chart.deleteRow(row.guid);
    }
    
    Chart.drawChart();
  }

  ///////////////////////////////////////////// Deal with Rules Directive /////////////////////////////////

  function showRules() {
    vm.rulesAreVisible = !vm.rulesAreVisible;
  }

  function showPicker() {
    vm.pickerIsVisible = true;
  }

  function pickThisRow(row) {
    vm.oldRule.callBack(row.guid);
    vm.pickerIsVisible = false;
  }

  function showUpdateRowModal(mode) {
    vm.paramsForCreateEditModal.callback = createOrUpdateModalCallback;
    vm.paramsForCreateEditModal.row      = vm.row;
    vm.paramsForCreateEditModal.mode     = mode;

    ngDialog.open(
      {
        showClose      : true,
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
      promise = updateRows([vm.row]);
    } else if (data.create) {
      promise = addRow(data.newLineItem);
    }
    
    return promise;
    vm.showRowDefinitionModal.value = false;
  }

  ///////////////////////////////////////////// Old Stuff /////////////////////////////////

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
      vm.rowClasses.activate();
    }
    
    // Show modal.
    if (row.type &&
        vm.rowTypesWithModals.indexOf(row.type) !== -1) {
      vm.showModal = true;

      var bodyRect = document.body.getBoundingClientRect();
      var elemRect = cellElement.getBoundingClientRect();
      var offset   = elemRect.top - bodyRect.top;

      // vm.headerModal.newX = 0;        
      // vm.headerModal.newY = offset + 6;

      // rowHeaderModal.style.left = vm.headerModal.newX + "px";
      // rowHeaderModal.style.top  = vm.headerModal.newY + "px";
    } else {
      vm.showModal = false;
    }
  }

  function exitedModal() {
    vm.rowClasses.deactivate();
  }

  function RowClasses(){
    return {
      activate,
      deactivate,
    };

    function activate(){
      vm.$activeHeaderCell.addClass(vm.classes.hightlightHeaderCell);
      vm.$activeRow.addClass(vm.classes.hightlightRow);
    }
    
    function deactivate(){
      if (vm.$activeHeaderCell && vm.$activeHeaderCell.hasClass(vm.classes.hightlightHeaderCell) ) {
        vm.$activeHeaderCell.removeClass(vm.classes.hightlightHeaderCell);
      }
  
      if (vm.$activeRow) {
        vm.$activeRow.removeClass(vm.classes.hightlightRow);
      }
    }

  }

}

