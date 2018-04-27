(function() {
    'use strict';

    angular
        .module('app')
        .factory('SignupService', Service);

    function Service($http) {
        var service = {};

        service.CreateUser = CreateUser;

        var apiDomain = 'http://localhost:3000';

        return service;

        function CreateUser(UserDetails, callback) {
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
                    console.log(response);
                    callback(false, response.data);
                });
        }

    }

})();