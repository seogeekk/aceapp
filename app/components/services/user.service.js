(function() {
    'use strict';

    angular
        .module('app')
        .factory('UserService', Service);

    function Service($http, $localStorage) {
        var service = {};

        service.UpdateUser = UpdateUser;
        service.GetUserStatuses = GetUserStatuses;
        service.ChangeUserStatus = ChangeUserStatus;
        service.GetUserStatus = GetUserStatus;
        service.ResetPassword = ResetPassword;

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

                    callback(false,response.error);
                });
        }

        function GetUserStatuses() {

            var USERSTATUS_GID = 2;

            return $http.get(apiDomain + apiVersion + '/config/' + USERSTATUS_GID, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.config.length > 0) {

                        var userstatuses = [];
                        for (var i = 0; i < payload.config.length; i++) {
                            var item = { userstatusid: payload.config[i].ordinal, userstatusname: payload.config[i].shortdesc };
                            userstatuses.push(item);
                        }
                        return userstatuses;
                    } else {
                        return null;
                    }
                }, function(response) {
                    return null;
                });
        }

        function ChangeUserStatus(UserDetails, callback) {
            return $http.post(apiDomain + apiVersion + '/user/changestatus', UserDetails, config)
                .then( function (response) {

                    var payload = response.data;
                    if(payload.success) {

                        callback(true,payload);
                    } else {

                        callback(false,response.error);
                    }
                }, function(response) {

                    callback(false,response.error);
                });
        }

        function ResetPassword(UserDetails, callback) {

            return $http.post(apiDomain + '/changepasswd', UserDetails)
                .then( function (response) {

                    var payload = response.data;
                    if(payload.success) {

                        callback(true,payload);
                    } else {

                        callback(false,response.error);
                    }
                }, function(response) {

                    callback(false,response.error);
                });
        }

        function GetUserStatus(username) {
            return $http.get(apiDomain + apiVersion + '/user/getstatus/' + username, config)
                .then( function (response) {

                    var payload = response.data;
                    if(payload.success) {

                        return {userstatusid: payload.user.status, userstatusname: payload.user.statusname };
                    } else {

                        return null;
                    }
                }, function(response) {
                    return null;
                });
        }
    }

})();