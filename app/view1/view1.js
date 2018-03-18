'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl',
      resolve:  {
        customerDetails: ['CustomerService', function (CustomerService) {
            return CustomerService.getCustomer('6');
        }]
      }
  });
}])

.controller('View1Ctrl', ['CustomerService', 'customerDetails', '$scope', function(CustomerService, customerDetails, $scope) {
   $scope.name = 'Ken';
   $scope.getCustomer = customerDetails.customer;

   $scope.click = function () {
       CustomerService.getCustomer('6');
   }
}]);