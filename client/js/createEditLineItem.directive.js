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
	var vm        = this;
	vm.data       = $scope.params;
	vm.closeModal = closeModal;

	if (vm.data.mode === 'update') {
		vm.newLineItem = vm.data.row;
		vm.button = {
			label   : 'update',
			function: update,
		};
	} else if (vm.data.mode ==='create') {
		vm.button = {
			label   : 'create',
			function: create,
		};

    vm.newLineItem = {
			name    : 'new row',
			scenario: vm.data.row.scenario,
			type    : 'lineItem',
			name    : 'new row',
			seedData: {
				seedDataType  : 'periodicDates',
				initialPayment: {
		      date  : '01/01/2017',
		      amount: 999,
		    },
        numDaysInInterval: 30,
        numPayments      : -1,
      }
    };   	
	}

	// not used
	var myForm = document.getElementById('my-form');

	vm.showRowDefinitionModal = $scope.params.showRowDefinitionModal;
	
  //////////////////////

  function closeModal() {
		vm.showRowDefinitionModal.value = false;
  }

  function update() {
  	var payload = {update: true};
  	vm.data.callback(payload)
  }

  function create() {
  	var payload = {
  		create: true,
  		newLineItem: vm.newLineItem,
  	};
  	vm.data.callback(payload)
  }




}