(function() {
    'use strict';

    angular
        .module('app')
        .factory('ClaimService', Service);

    function Service($http, $localStorage) {
        var service = {};

        service.GetClaim = GetClaim;


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

        function GetClaim(/* might use username */callback) {
            $http.get(apiDomain + apiVersion + '/claim', config)
                .then( function (response) {

                    var payload = response.data;
                    if(payload.claims.length > 0) {
                       callback(payload.claims);
                    } else {
                        callback(null);
                    }
                }, function(response) {
                    callback(null);
                });
        }

    }

})();