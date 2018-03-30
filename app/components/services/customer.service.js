(function() {
    'use strict';

    angular
        .module('app')
        .factory('CustomerService', Service);

    function Service($http, $localStorage) {
        var service = {};

        service.CreateCustomer = CreateCustomer;
        service.GetCustomerTypes = GetCustomerTypes;
        service.CustomerExists = CustomerExists;
        service.UpdateCustomer = UpdateCustomer;
        service.GetCustomerDetails = GetCustomerDetails;


        var apiDomain = 'http://localhost:3000';
        var apiVersion = '/api/v1';

        var config = {
            headers: {
                'content-type': 'application/json',
                'x-access-token': $localStorage.currentUser.token,
                'x-key': $localStorage.currentUser.username
            }
        };


        return service;

        function GetCustomerTypes() {

            var CUSTTYPE_GID = 6;

            return $http.get(apiDomain + apiVersion + '/config/' + CUSTTYPE_GID, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.config.length > 0) {

                        var custtypes = [];
                        for (var i = 0; i < payload.config.length; i++) {
                            var item = { custtypeid: payload.config[i].ordinal, custtypename: payload.config[i].longdesc };
                            custtypes.push(item);
                        }
                        return custtypes;
                    } else {
                        return null;
                    }
                }, function(response) {
                    return null;
                });
        }

        function CreateCustomer(UserDetails, callback) {
            return $http.post(apiDomain + apiVersion + '/customer/new', UserDetails, config)
                .then( function (response) {
                    // login successful if there's a token in the reponse
                    var payload = response.data;
                    if(payload.success) {
                        // store username and token in local storage to keep user logged in between page refreshes
                        callback(true,payload.customer);
                    } else {
                        // execute callback with false to indicate failed login
                        callback(false,response.error);
                    }
                }, function(response) {
                    console.log(response);
                    callback(false,response.error);
                });
        }

        function UpdateCustomer(UserDetails, callback) {
            return $http.post(apiDomain + apiVersion + '/customer/update', UserDetails, config)
                .then( function (response) {
                    // login successful if there's a token in the reponse
                    var payload = response.data;
                    if(payload.success) {
                        // store username and token in local storage to keep user logged in between page refreshes
                        callback(true,payload.customer);
                    } else {
                        // execute callback with false to indicate failed login
                        callback(false,response.error);
                    }
                }, function(response) {
                    console.log(response);
                    callback(false,response.error);
                });
        }

        function CustomerExists(username) {
            return $http.get(apiDomain + apiVersion + '/customer/' + username, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        return payload.customer.customerid;
                    } else {
                        return null;
                    }
                }, function(response) {
                    return null;
                });
        }
        function GetCustomerDetails(username) {
            return $http.get(apiDomain + apiVersion + '/customer/' + username, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        return payload.customer;
                    } else {
                        return null;
                    }
                }, function(response) {
                    return null;
                });
        }
    }

})();