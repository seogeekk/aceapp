(function() {
    'use strict';

    angular
        .module('app')
        .factory('AuthenticationService', Service);

    function Service($http, $localStorage) {
        var service = {};

        service.Login = Login;
        service.Logout = Logout;

        var apiDomain = 'http://localhost:3000';

        return service;

        function Login(username, password, callback) {
            $http.post(apiDomain + '/login', {username: username, password: password})
                .then( function (response) {
                    // login successful if there's a token in the reponse
                    var payload = response.data;
                    if(payload.token) {
                        // store username and token in local storage to keep user logged in between page refreshes
                        $localStorage.currentUser = {
                            username: payload.user.username,
                            token: payload.token,
                            firstname: payload.user.firstname,
                            lastname: payload.user.lastname,
                            roleid: payload.user.roleid,
                            status: payload.user.status
                        };

                        // add jwt token to auth header for all requests made by the $http service
                        $http.defaults.headers.post['x-access-token'] = payload.token;
                        $http.defaults.headers.post['x-key'] = payload.user.username;

                        // execute callback with true to indicate successful login
                        callback(true);
                    } else {
                        // execute callback with false to indicate failed login
                        callback(false);
                    }
                }, function(response) {
                    console.log(response);
                    callback(false);
                });
        }

        function Logout() {
            // remove user from local storage and clear http auth header
            delete $localStorage.currentUser;
            $http.defaults.headers.post['x-access-token'] = '';
            $http.defaults.headers.post['x-key'] = '';
        }


    }

})();