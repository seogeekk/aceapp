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
        service.GetAllCustomer = GetAllCustomer;
        service.SearchCustomer = SearchCustomer;
        service.GetAllClaims = GetAllClaims;

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
            $http.post(apiDomain + '/createuser', UserDetails)
                .then( function (response) {
                    var payload = response.data;
                    if(response.status == 200) {
                        callback(true, payload);
                    } else {
                        // execute callback with false to indicate failed login
                        callback(false, payload);
                    }
                }, function(response) {
                    callback(false, response.data);
                });
        }

        function GetAllClaims(username, callback) {
            $http.get(apiDomain + apiVersion + '/claim/user/' + username, config)
                .then( function (response) {
                    var payload = response.data;

                    if(payload.success) {
                        callback(true, payload.claims);
                    } else {
                        callback(false, null);
                    }
                }, function(response) {
                    callback(false, response.error);
                });
        }

        function UpdateCustomer(UserDetails, callback) {
            return $http.post(apiDomain + apiVersion + '/customer/update', UserDetails, config)
                .then( function (response) {

                    var payload = response.data;
                    if(payload.success) {
                        callback(true,payload.customer);
                    } else {
                        callback(false,response.error);
                    }
                }, function(response) {
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

        function GetAllCustomer(callback) {
            $http.get(apiDomain + apiVersion + '/customer', config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        callback(true, payload.customers);
                    } else {
                        callback(false);
                    }
                }, function(response) {
                    callback(false);
                });
        }

        function SearchCustomer(query) {

            return $http.get(apiDomain + apiVersion + '/customer/search/?query=' + query, config)
                .then( function (response) {

                    var payload = response.data;

                    var results = [];

                    var customer = payload.customer;
                    for (var i = 0; i <customer.length; i++) {
                        results.push({username: customer[i].username, customername: customer[i].customername});
                    }
                    return results;
                }, function(response) {
                    return null;
                });
        }
    }

})();