// angular.module('nodeTodo', [])
// .controller('mainController', ($scope, $http) => {
  
//   console.log('app.js');
  
//   $scope.formData = {};
//   $scope.blocks = {};

//   // Get all todos
//   $http.get('/api/v1/todos')
//   .success((data) => {
//     $scope.blocks = data;
    

//   })
//   .error((error) => {
//     console.log('Error: ' + error);
//   });

//   // Create a new todo
//   $scope.createTodo = () => {
//     $http.post('/api/v1/todos', $scope.formData)
//     .success((data) => {
//       $scope.formData = {};
//       $scope.blocks = data;
//       console.log(data);
//     })
//     .error((error) => {
//       console.log('Error: ' + error);
//     });
//   };

//   // Delete a todo
//   $scope.deleteTodo = (todoID) => {
//     $http.delete('/api/v1/todos/' + todoID)
//     .success((data) => {
//       $scope.blocks = data;
//       console.log(data);
//     })
//     .error((data) => {
//       console.log('Error: ' + data);
//     });
//   };
// });
