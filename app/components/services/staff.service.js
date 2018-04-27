(function() {
    'use strict';

    angular
        .module('app')
        .factory('StaffService', Service);

    function Service($http, $localStorage) {
        var service = {};

        service.CreateStaff = CreateStaff;
        service.GetAccessTypes = GetAccessTypes;
        service.GetDeparments = GetDeparments;
        service.UpdateStaff = UpdateStaff;
        service.GetStaffDetails = GetStaffDetails;
        service.GetAllStaff = GetAllStaff;
        service.GetUserTypes = GetUserTypes;
        service.SearchStaff = SearchStaff;
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

        function GetAccessTypes() {

            var ACCESSTYPE_GID = 8;

            return $http.get(apiDomain + apiVersion + '/config/' + ACCESSTYPE_GID, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.config.length > 0) {

                        var accesstypes = [];
                        for (var i = 0; i < payload.config.length; i++) {
                            var item = { accesstypeid: payload.config[i].ordinal, accesstypename: payload.config[i].longdesc };
                            accesstypes.push(item);
                        }
                        return accesstypes;
                    } else {
                        return null;
                    }
                }, function(response) {
                    return null;
                });
        }

        function GetUserTypes() {

            var USERTYPE_GID = 1;

            return $http.get(apiDomain + apiVersion + '/config/' + USERTYPE_GID, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.config.length > 0) {

                        var usertypes = [];
                        for (var i = 0; i < payload.config.length; i++) {
                            var item = { usertypeid: payload.config[i].ordinal, usertypename: payload.config[i].shortdesc };
                            usertypes.push(item);
                        }
                        return usertypes;
                    } else {
                        return null;
                    }
                }, function(response) {
                    return null;
                });
        }

        function GetDeparments() {

            var ACCESSTYPE_GID = 7;

            return $http.get(apiDomain + apiVersion + '/config/' + ACCESSTYPE_GID, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.config.length > 0) {

                        var departments = [];
                        for (var i = 0; i < payload.config.length; i++) {
                            var item = { departmentid: payload.config[i].ordinal, departmentname: payload.config[i].longdesc };
                            departments.push(item);
                        }
                        return departments;
                    } else {
                        return null;
                    }
                }, function(response) {
                    return null;
                });
        }

        function GetAllClaims(username, callback) {
            $http.get(apiDomain + apiVersion + '/claim/staff/' + username, config)
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

        function CreateStaff(UserDetails, callback) {
            $http.post(apiDomain + '/createuser', UserDetails)
                .then( function (response) {
                    console.log(response);
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

        function UpdateStaff(UserDetails, callback) {
            return $http.post(apiDomain + apiVersion + '/staff/update', UserDetails, config)
                .then( function (response) {

                    var payload = response.data;
                    if(payload.success) {
                        callback(true,payload.staff);
                    } else {
                        callback(false,response.error);
                    }
                }, function(response) {
                    console.log(response);
                    callback(false,response.error);
                });
        }

        function GetStaffDetails(username) {
            return $http.get(apiDomain + apiVersion + '/staff/' + username, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        return payload.staff;
                    } else {
                        return null;
                    }
                }, function(response) {
                    return null;
                });
        }

        function GetAllStaff(callback) {
            return $http.get(apiDomain + apiVersion + '/staff/', config)
                .then( function (response) {

                    var payload = response.data;
                    if(payload.success) {
                        callback(true,payload.staff);
                    } else {
                        callback(false);
                    }
                }, function(response) {
                    callback(false,response);
                });
        }

        function SearchStaff(query) {

            return $http.get(apiDomain + apiVersion + '/staff/search/?query=' + query, config)
                .then( function (response) {

                    var payload = response.data;

                    var results = [];

                    var staff = payload.staff;
                    for (var i = 0; i <staff.length; i++) {
                        results.push({username: staff[i].username, staffname: staff[i].staffname});
                    }
                    return results;
                }, function(response) {
                    return null;
                });
        }
    }

})();