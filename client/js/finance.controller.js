"use strict";

angular.module('app',[])
	.controller('FinanceTable', financeController);

function financeController($scope, $http) {
  console.log('financeController controller');
  
  $scope.myScopeVar = "property from financeController";

  $scope.formData = {};
  $scope.blocks = {};
  
}