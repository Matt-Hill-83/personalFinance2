"use strict"
angular.module('app').factory('Api', ['$http', ApiController]);

function ApiController($http){

  var service = {
    get : getAllBlocks,
  };

  return service;

  ///////////////

  function getAllBlocks() {
    return $http.get('/blocks')
    .success((data) => {
    })
    .error((error) => {
      console.log('Error: ' + error);
    });

  }

}
