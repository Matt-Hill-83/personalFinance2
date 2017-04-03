"use strict"
angular.module('app').factory('Utilities', [Utilities_]);

function Utilities_() {
  var months      = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var monthsLower = months.map(month=> month.toLowerCase());
  var weekdays    = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  var service = {
    addDays,
    arrayIncludes,
    arrayDoesNotInclude,
    areDatesEqual,
    clearArray,
    concatArrayPreserveReference,
    getLast,
    guid,
    initArray,
    months,
    monthsLower,
    padNumber,
    addClasses,
    sortSections,
    weekdays,
  };

  return service;

  ///////////////

  function addClasses(element, classes) {
    if (element.classes) {
      element.classes.push(...classes);
    } else {
      element.classes = classes;
    }
    return element;
  }

  function arrayIncludes(array, item) {
    return array.indexOf(item) !== -1;
  }

  function arrayDoesNotInclude(array, item) {
    return array.indexOf(item) === -1;
  }

  function sortSections(sections) {
    sections.sort(function(a, b) { 
      return a.indexWithinParent - b.indexWithinParent;
    });
    return sections;    
  }

  function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function areDatesEqual(date1, date2) {
    return date1.valueOf() === date2.valueOf();
  }

  function padNumber(number) {
    return (number < 10) ? '0' + number : number;
  }

  function concatArrayPreserveReference(array1, array2) {
    // Using .push and the spread operator maintains the array reference.
    array1.push(...array2);
  }

  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }  

  function initArray(length, value) {
    return Array(length).fill(angular.copy(value));
  }

  function getLast(array) {
    return array.slice(-1)[0];
  }

  function clearArray(array) {
    return array ? array.splice(0, array.length) : [];
  }

}
