(function() {
    'use strict';

    angular
        .module('app')
        .factory('AddressService', Service);

    function Service($http, $localStorage) {
        var service = {};

        service.SearchAddress = SearchAddress;
        service.CompleteAddress = CompleteAddress;


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

        function SearchAddress(query) {

            return $http.get(apiDomain + apiVersion + '/address/search/?q=' + query, config)
                .then( function (response) {

                    var payload = response.data;

                    var results = [];

                    var address = payload.address;

                    for (var i = 0; i <address.length; i++) {

                        results.push(address[i].full_address);
                    }

                    return results;
                }, function(response) {
                    return null;
                });
        }

        function CompleteAddress(query) {

            return $http.get(apiDomain + apiVersion + '/address/complete/?q=' + query, config)
                .then( function (response) {

                    var payload = response.data;

                    return payload.address;
                }, function(response) {
                    return {success: false};
                });
        }
    }

})();