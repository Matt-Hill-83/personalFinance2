"use strict";

angular.module('app',[])
	.controller('FinanceTable', mainController);

function mainController($scope, $http) {
  $scope.myScopeVar = "property from mainController";

  $scope.formData = {};
  $scope.todoData = {};
  // Get all todos
  $http.get('/api/v1/todos')
  .success((data) => {
    $scope.todoData = data;


    console.log('|++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|');
    console.log('data: ');
    console.table(data);
    console.log('|------------------------------------------------------------------------------------------------|')
    
    


  })
  .error((error) => {
    console.log('Error: ' + error);
  });

  
}