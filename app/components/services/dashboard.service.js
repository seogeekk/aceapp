(function() {
    'use strict';

    angular
        .module('app')
        .factory('DashboardService', Service);

    function Service($http, $localStorage) {
        var service = {};

        service.GetStaffDashboard = GetStaffDashboard;
        service.GetUserDashboard = GetUserDashboard;
        service.GetStaffCalendar = GetStaffCalendar;


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

        function GetUserDashboard(username, callback) {
            $http.get(apiDomain + apiVersion + '/dashboard/user/' + username, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        callback(true, payload.dashboard);
                    } else {
                        callback(false);
                    }
                }, function(response) {
                    callback(false);
                });
        }

        function GetStaffDashboard(username, callback) {
            $http.get(apiDomain + apiVersion + '/dashboard/staff/' + username, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        callback(true, payload.dashboard);
                    } else {
                        callback(false);
                    }
                }, function(response) {
                    callback(false);
                });
        }

        function GetStaffCalendar(username, callback) {
            $http.get(apiDomain + apiVersion + '/dashboard/calendar/' + username, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        callback(true, payload.calendar);
                    } else {
                        callback(false);
                    }
                }, function(response) {
                    callback(false);
                });
        }
    }

})();