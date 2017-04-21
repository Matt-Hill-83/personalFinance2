"use strict";

var app = angular.module('app',['ngRoute', 'ngDialog', 'ngCookies']);
app.controller('FinanceTable', [
		'$scope',
		'$http',
		'ngDialog',
		'Utilities',
		'$cookies',
		financeController
]);

function financeController(
	$scope,
	$http,
	ngDialog,
	Utilities,
	$cookies
	) {

  // Retrieving a cookie
  var cookie = $cookies.get('userGuid');

  // If there is no 'userGuid' cookie, create one.
  // This will be used to identify which records were created by the current user.
  // This is a very hacky form of authentication.
  if (!cookie) {
	  var userGuid = Utilities.guid();
	  $cookies.put('userGuid', userGuid);
  }

	$scope.favoriteCookie = $cookies.get('userGuid');
  
	// monkey patch .every function if it doesn't exist.
	if (!Array.prototype.every)
	{
	   Array.prototype.every = function(fun /*, thisp*/)
	   {
	      var len = this.length;
	      if (typeof fun != "function")
	      throw new TypeError();
	      
	      var thisp = arguments[1];
	      for (var i = 0; i < len; i++)
	      {
	         if (i in this && !fun.call(thisp, this[i], i, this))
	         return false;
	      }
	      return true;
	   };
	}

}

app.filter('html', function($sce) {
  return function(val) {
    return $sce.trustAsHtml(val);
  };
});
