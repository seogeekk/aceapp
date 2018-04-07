(function() {
    'use strict';

    angular
        .module('app')
        .factory('WorklogService', Service);

    function Service($http, $localStorage, Upload) {
        var service = {};

        service.GetWorkItems = GetWorkItems;
        service.GetWorkTypes = GetWorkTypes;
        service.CreateWorklog = CreateWorklog;
        service.WorklogExists = WorklogExists;
        service.UpdateWorklog = UpdateWorklog;

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

        function GetWorkItems(claimid) {
            return $http.get(apiDomain + apiVersion + '/worklog/workitems/' + claimid, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        return payload.workitems;
                    } else {
                        return null;
                    }
                }, function(response) {
                    return null;
                });
        }

        function GetWorkTypes() {

            var WORKTYPE_GID = 11;

            return $http.get(apiDomain + apiVersion + '/config/' + WORKTYPE_GID, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.config.length > 0) {

                        var worktypes = [];
                        for (var i = 0; i < payload.config.length; i++) {
                            var item = { worktypetypeid: payload.config[i].ordinal, worktypename: payload.config[i].longdesc };
                            worktypes.push(item);
                        }
                        return worktypes;
                    } else {
                        return null;
                    }
                }, function(response) {
                    return null;
                });
        }

        function CreateWorklog(WorklogDetails, attachment, callback) {

            var form = new FormData();
            form.append('attachment', attachment);

            for ( var key in WorklogDetails ) {
                form.append(key, WorklogDetails[key]);
            }

            var config = {
                headers: {
                    'Content-Type': undefined,
                    'x-access-token': $localStorage.currentUser.token,
                    'x-key': $localStorage.currentUser.username
                },
                transformRequest: angular.identity
            };

            console.log(config);
            return $http.post(apiDomain + apiVersion + '/worklog/new', form, config)
                .then( function (response) {
                    // login successful if there's a token in the reponse
                    console.log(response);
                    var payload = response.data;
                    if(payload.success) {
                        callback(true,payload.workitem);
                    } else {
                        callback(false);
                    }
                }, function(response) {
                    callback(false,response);
                });
        }

        function UpdateWorklog(WorklogDetails, callback) {

            var form = new FormData();
            form.append('attachment', attachment);

            for ( var key in WorklogDetails ) {
                form.append(key, WorklogDetails[key]);
            }

            var config = {
                headers: {
                    'content-type': undefined,
                    'x-access-token': $localStorage.currentUser.token,
                    'x-key': $localStorage.currentUser.username
                },
                transformResponse: angular.identity
            };

            return $http.post(apiDomain + apiVersion + '/worklog/update', form, config)
                .then( function (response) {
                    // login successful if there's a token in the reponse
                    var payload = response.data;
                    if(payload.success) {
                        callback(true,payload.workitem);
                    } else {
                        callback(false, [{data: {code: 'NO_RESULTS'}}]);
                    }
                }, function(response) {
                    callback(false, response);
                });
        }

        function WorklogExists(workitemid) {
            return $http.get(apiDomain + apiVersion + '/worklog/workitem/' + workitemid, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        return payload.workitem.workitemid;
                    } else {
                        return null;
                    }
                }, function(response) {
                    return null;
                });
        }

    }

})();