(function() {
    'use strict';

    angular
        .module('app')
        .factory('WorklogService', Service);

    function Service($http, $localStorage) {
        var service = {};

        service.GetWorkItems = GetWorkItems;
        service.GetWorkTypes = GetWorkTypes;
        service.CreateWorklog = CreateWorklog;
        service.WorklogExists = WorklogExists;
        service.UpdateWorklog = UpdateWorklog;
        service.DeleteAttachment = DeleteAttachment;
        service.SendInspectionMail = SendInspectionMail;
        service.SendNotificationMail = SendNotificationMail;
        service.DownloadAttachment = DownloadAttachment;

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
            if (attachment) {
                form.append('attachment', attachment);
            }

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

            $http.post(apiDomain + apiVersion + '/worklog/new', form, config)
                .then( function (response) {
                    var payload;
                    if (typeof response.data === 'object') {
                        payload = response.data;
                    } else {
                        payload = JSON.parse(response.data);
                    }
                    if(payload.success) {
                        callback(true,payload.workitem);
                    } else {
                        callback(false);
                    }
                }, function(response) {
                    callback(false,response);
                });
        }

        function UpdateWorklog(WorklogDetails, attachment, callback) {

            var form = new FormData();
            if (attachment) {
                form.append('attachment', attachment);
            }

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

            console.log(WorklogDetails);
            $http.post(apiDomain + apiVersion + '/worklog/update', form, config)
                .then( function (response) {
                    var payload;
                    if (typeof response.data === 'object') {
                        payload = response.data;
                    } else {
                        payload = JSON.parse(response.data);
                    }

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

        function SendInspectionMail(Mail) {
            return $http.post(apiDomain + apiVersion + '/notification/inspection', Mail, config)
                .then( function (response) {

                    var payload = response.body;

                    return;
                }, function(response) {
                    return false;
                });
        }

        function SendNotificationMail(Mail) {
            return $http.post(apiDomain + apiVersion + '/notification/claimstatus', Mail, config)
                .then( function (response) {

                    var payload = response.body;

                    return;
                }, function(response) {
                    return false;
                });
        }

        function DeleteAttachment(workitemid, itemid) {
            return $http.post(apiDomain + apiVersion + '/worklog/upload/delete', {workitemid: workitemid, itemid: itemid}, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        return true;
                    } else {
                        return false;
                    }
                }, function(response) {
                    return false;
                });
        }

        function DownloadAttachment(itemid, callback) {
            // Set response type
            config.responseType = 'arraybuffer';
            //
            $http.get(apiDomain + apiVersion + '/attachment/download/' + itemid, config)
                .then( function (response) {
                    if (response.data.success) {
                        callback(false);
                    } else {
                        callback(true, {
                            blob: response.data,
                            type: response.headers("content-type")
                        });
                    }

                }, function(response) {
                    callback(false);
                })
        }

    }

})();