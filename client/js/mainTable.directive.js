angular.module('app')
  .directive('financeView', [mainTableController]);

function mainTableController(Table, Constants) {
  return {
    restrict    : 'E',
    templateUrl : 'views/table.html',
    controller  : [
      'Api',
      'Chart',
      '$rootScope',
      '$scope',
      '$http',
      'Table',
      'Constants',
      Ctrl
    ],
    controllerAs: 'maintable',
  };
}

function Ctrl(
  Api,
  Chart,
  $rootScope,
  $scope,
  $http,
  Table,
  Constants
  ) { 
  console.log('financeView Directive');
  
  // attach jQuery datepicker styling to date input
  $(function() {
    $( "#datepicker" ).datepicker({});
  });

  var vm              = this;
  vm.rowHeaderModalId = 'myModal';

  vm.redrawTable = redrawTable;
  vm.tableConfig = Constants.tableConfig;
  
  vm.tableData     = Table.tableData;
  vm.tableMatrix   = Table.tableMatrix;
  vm.enteredHeader = enteredHeader;
  vm.exitedHeader  = exitedHeader;

  vm.enteredModal        = enteredModal;
  vm.exitedModal         = exitedModal;
  vm.changeCollapseState = changeCollapseState;

  vm.cell;
  vm.showModal;
  var rowTypesWithModals  = ['lineItem'];
  var rowTypesToHighLight = ['lineItem', 'section', 'tally'];

  var $activeHeaderCell;
  var $activeRow;

  var rowClasses = RowClasses();

  var classes = {
    hightlightHeaderCell: 'hightlightHeaderCell',
    hightlightRow       : 'hightlightRow',
  };


  Api.get().then((resp) => {
    Constants.newData = resp.data;
    Table.redrawTable(vm.tableConfig);
    Chart.drawChart();

  });

  //////////////

  function redrawTable() {
    Constants.refreshTableConfig();
    Table.redrawTable(Constants.tableConfig);
  }

  function changeCollapseState(row) {
    if (row.type === 'section' && row.collapsed) {
      Table.expandSection(row);
    } else if (row.type === 'section' && !row.collapsed) {
      Table.collapseSection(row);
    }
  }

  function enteredHeader(event, rowIndex, colIndex, row, cell) {
    vm.cell            = cell;
    vm.row             = row;
    var rowHeaderModal = document.getElementById(vm.rowHeaderModalId);
    
    // Clear the row highlighting of the row you left when you enter a new row.
    rowClasses.deactivate();

    var cellElement   = event.target;
    var rowElement    = event.target.parentElement;
    $activeHeaderCell = $(cellElement);
    $activeRow        = $(rowElement);

    // Apply hightlight class
    if (rowTypesToHighLight.indexOf(row.type) !== -1) {
      rowClasses.activate();
    }
    
    // Show modal.
    if (row.type &&
        rowTypesWithModals.indexOf(row.type) !== -1) {
      vm.showModal = true;

      var bodyRect = document.body.getBoundingClientRect();
      var elemRect = cellElement.getBoundingClientRect();
      var offset   = elemRect.top - bodyRect.top;

      var newX = 0;        
      var newY = offset + 6;

      rowHeaderModal.style.left = newX + "px";
      rowHeaderModal.style.top  = newY + "px";
    } else {
      vm.showModal = false;
    }
  }

  function exitedHeader(event, rowIndex, colIndex, row, cell) {
  }

  function enteredModal() {
  }

  function exitedModal() {
    rowClasses.deactivate();
  }

  function RowClasses(){
    return {
      activate,
      deactivate,
    };

    function activate(){
      $activeHeaderCell.addClass(classes.hightlightHeaderCell);
      $activeRow.addClass(classes.hightlightRow);
    }
    
    function deactivate(){
      if ($activeHeaderCell && $activeHeaderCell.hasClass(classes.hightlightHeaderCell) ) {
        $activeHeaderCell.removeClass(classes.hightlightHeaderCell);
      }
  
      if ($activeRow) {
        $activeRow.removeClass(classes.hightlightRow);
      }
    }

  }

}

