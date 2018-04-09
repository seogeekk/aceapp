(function() {
    'use strict';

    angular
        .module('app')
        .factory('UserService', Service);

    function Service($http, $localStorage) {
        var service = {};

        service.UpdateUser = UpdateUser;


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

        function UpdateUser(UserDetails, callback) {
            return $http.post(apiDomain + apiVersion + '/user/update', UserDetails, config)
                .then( function (response) {
                    // login successful if there's a token in the reponse
                    var payload = response.data;
                    if(payload.success) {
                        // store username and token in local storage to keep user logged in between page refreshes
                        callback(true,payload.user);
                    } else {
                        // execute callback with false to indicate failed login
                        callback(false,response.error);
                    }
                }, function(response) {
                    console.log(response);
                    callback(false,response.error);
                });
        }
    }

})();