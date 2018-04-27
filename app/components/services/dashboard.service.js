(function() {
    'use strict';

    angular
        .module('app')
        .factory('DashboardService', Service);

    function Service($http, $localStorage) {
        var service = {};

        service.GetStaffDashboard = GetStaffDashboard;
        service.GetAdminDashboard = GetAdminDashboard;
        service.GetUserDashboard = GetUserDashboard;
        service.GetStaffCalendar = GetStaffCalendar;
        service.GetSuburbStat = GetSuburbStat;
        service.GetCompletionStat = GetCompletionStat;
        service.GetRequestTypeStat = GetRequestTypeStat;
        service.GetRequestCountStat = GetRequestCountStat;
        service.GetRequestDurationStat = GetRequestDurationStat;
        service.GetStaffStat = GetStaffStat;
        service.GetCustomerStat = GetCustomerStat;

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

        function GetAdminDashboard(callback) {
            $http.get(apiDomain + apiVersion + '/dashboard/admin/', config)
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

        function GetSuburbStat(reportdate, callback) {
            $http.get(apiDomain + apiVersion + '/stats/suburb/' + reportdate, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        callback(true, payload.stats);
                    } else {
                        callback(false);
                    }
                }, function(response) {
                    callback(false);
                });
        }

        function GetCompletionStat(reportdate, callback) {
            $http.get(apiDomain + apiVersion + '/stats/completion/' + reportdate, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        callback(true, payload.stats);
                    } else {
                        callback(false);
                    }
                }, function(response) {
                    callback(false);
                });
        }

        function GetRequestTypeStat(reportdate, callback) {
            $http.get(apiDomain + apiVersion + '/stats/requesttype/' + reportdate, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        callback(true, payload.stats);
                    } else {
                        callback(false);
                    }
                }, function(response) {
                    callback(false);
                });
        }

        function GetRequestCountStat(reportdate, callback) {
            $http.get(apiDomain + apiVersion + '/stats/requestcount/' + reportdate, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        callback(true, payload.stats);
                    } else {
                        callback(false);
                    }
                }, function(response) {
                    callback(false);
                });
        }

        function GetRequestDurationStat(reportdate, callback) {
            $http.get(apiDomain + apiVersion + '/stats/requestduration/' + reportdate, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        callback(true, payload.stats);
                    } else {
                        callback(false);
                    }
                }, function(response) {
                    callback(false);
                });
        }

        function GetStaffStat(reportdate, callback) {
            $http.get(apiDomain + apiVersion + '/stats/staff/' + reportdate, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        callback(true, payload.stats);
                    } else {
                        callback(false);
                    }
                }, function(response) {
                    callback(false);
                });
        }

        function GetCustomerStat(reportdate, callback) {
            $http.get(apiDomain + apiVersion + '/stats/customer/' + reportdate, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        callback(true, payload.stats);
                    } else {
                        callback(false);
                    }
                }, function(response) {
                    callback(false);
                });
        }
    }

})();