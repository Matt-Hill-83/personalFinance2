angular.module('app')
  .directive('createEditLineItem', [createEditLineItemController]);

function createEditLineItemController() {
  return {
    scoperestrict    : 'E',
    templateUrl : 'views/createEditLineItem.template.html',
    scope: {
      params: '='
    },    
    controller  : ['$scope', CreateEditCtrl],
    controllerAs: 'createEditLineItem',
  };
}

function CreateEditCtrl($scope) {
  var defaultDate = new Date('01-01-2017');
  
	var vm        = this;
	vm.data       = $scope.params;
	vm.closeModal = closeModal;
  vm.isLineItem = false;

  if (vm.data.mode === 'update') {
    vm.newBlock   = vm.data.row;
    
    vm.button = {
      label   : 'Update',
      function: update,
    };
  } else if (vm.data.mode ==='create') {
    // vm.isLineItem = true;
    
    vm.button = {
      label   : 'Create',
      function: create,
    };

    vm.newBlock = {
      name      : 'new row',
      parentGuid: vm.data.row.guid,
      scenario  : vm.data.row.scenario,
      type      : 'lineItem',
      seedData: {
        seedDataType  : 'periodicDates',
        initialPayment: {
          date  : defaultDate,
          amount: 999,
        },
        numDaysInInterval: 30,
        numPayments      : null,
      }
    };    

    var parentGuid;
    var indexWithinParent;
    var lineItem = vm.data.row;

    if (lineItem.type === 'lineItem') {
      parentGuid        = lineItem.parentGuid;
      indexWithinParent = lineItem.indexWithinParent + 1;
    } else if (lineItem.type === 'section'){
      parentGuid        = lineItem.guid;
      indexWithinParent = 0;
    }
    
    vm.newBlock.indexWithinParent = indexWithinParent;
    vm.newBlock.parentGuid        = parentGuid;
  }
  vm.isLineItem = (vm.newBlock.type === 'lineItem') && (subtype1 !== 'interest');

  //////////////////////

  function closeModal() {
  	$scope.params.ngDialog.close();
  }

  function update() {
  	var payload = {
      update  : true,
      lineItem: vm.newBlock,
    };

  	vm.data.callback(payload);
  	closeModal();
  }

  function create() {
  	var payload = {
      create     : true,
      newLineItem: vm.newBlock,
  	};
  	vm.data.callback(payload);
  	closeModal();
  }
}