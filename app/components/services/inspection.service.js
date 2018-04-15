(function() {
    'use strict';

    angular
        .module('app')
        .factory('InspectionService', Service);

    function Service($http) {
        var service = {};

        service.GetInspectionByToken = GetInspectionByToken;
        service.UpdateInspectionResponse = UpdateInspectionResponse;

        var apiDomain = 'http://localhost:3000';
        var apiVersion = '/api/v1';

        return service;


        function GetInspectionByToken(token, callback) {

            $http.get(apiDomain + '/inspection-view/' + token, {headers: {'content-type': 'application/json', 'x-access-token': token}})
                .then( function (response) {
                    var payload = response.data;
                    if (payload.success) {
                        callback(true, payload.inspection);
                    } else {
                        callback(false);
                    }
                }, function (response) {
                    callback(false);
                })
        }

        function UpdateInspectionResponse(token, payload, callback) {

            $http.post(apiDomain + '/inspection-view', payload,{headers: {'content-type': 'application/json', 'x-access-token': token}})
                .then( function (response) {
                    var payload = response.data;
                    if (payload.success) {
                        callback(true, payload.response);
                    } else {
                        callback(false);
                    }
                }, function (response) {
                    callback(false);
                })
        }

    }

})();