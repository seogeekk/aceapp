(function() {
    'use strict';

    angular
        .module('app')
        .factory('ClaimService', Service);

    function Service($http, $localStorage) {
        var service = {};

        service.GetAllClaims = GetAllClaims;
        service.CreateClaim = CreateClaim;
        service.UpdateClaim = UpdateClaim;
        service.ClaimExists = ClaimExists;
        service.GetClaimByUser = GetClaimByUser;
        service.GetClaimTypes = GetClaimTypes;
        service.GetClaimDetails = GetClaimDetails;
        service.GetStatusTypes = GetStatusTypes;

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

        function GetClaimDetails(claimid) {
            return $http.get(apiDomain + apiVersion + '/claim/' + claimid, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        return payload.claim;
                    } else {
                        return null;
                    }
                }, function(response) {
                    return null;
                });
        }

        function GetAllClaims(callback) {
            $http.get(apiDomain + apiVersion + '/claim', config)
                .then( function (response) {

                    var payload = response.data;
                    if(payload.claims.length > 0) {
                       callback(payload.claims);
                    } else {
                        callback(null);
                    }
                }, function(response) {
                    callback(null);
                });
        }

        function GetClaimTypes() {

            var CLAIMTYPE_GID = 3;

            return $http.get(apiDomain + apiVersion + '/config/' + CLAIMTYPE_GID, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.config.length > 0) {

                        var claimtypes = [];
                        for (var i = 0; i < payload.config.length; i++) {
                            var item = { claimtypeid: payload.config[i].ordinal, claimtypename: payload.config[i].shortdesc };
                            claimtypes.push(item);
                        }
                        return claimtypes;
                    } else {
                        return null;
                    }
                }, function(response) {
                    return null;
                });
        }

        function GetStatusTypes() {

            var STATUSTYPE_GID = 4;

            return $http.get(apiDomain + apiVersion + '/config/' + STATUSTYPE_GID, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.config.length > 0) {

                        var statustypes = [];
                        for (var i = 0; i < payload.config.length; i++) {
                            var item = { statustypeid: payload.config[i].ordinal, statusname: payload.config[i].longdesc };
                            statustypes.push(item);
                        }
                        return statustypes;
                    } else {
                        return null;
                    }
                }, function(response) {
                    return null;
                });
        }

        function CreateClaim(ClaimDetails, callback) {
            return $http.post(apiDomain + apiVersion + '/claim/new', ClaimDetails, config)
                .then( function (response) {
                    // login successful if there's a token in the reponse
                    var payload = response.data;
                    if(payload.success) {
                        callback(true,payload.claim);
                    } else {
                        callback(false);
                    }
                }, function(response) {
                    callback(false,response);
                });
        }

        function UpdateClaim(ClaimDetails, callback) {
            return $http.post(apiDomain + apiVersion + '/claim/update', ClaimDetails, config)
                .then( function (response) {
                    // login successful if there's a token in the reponse
                    var payload = response.data;
                    if(payload.success) {
                        callback(true,payload.claim);
                    } else {
                        callback(false, [{data: {code: 'NO_RESULTS'}}]);
                    }
                }, function(response) {
                    callback(false, response);
                });
        }

        function ClaimExists(claimid) {
            return $http.get(apiDomain + apiVersion + '/claim/' + claimid, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        return payload.claim.claimid;
                    } else {
                        return null;
                    }
                }, function(response) {
                    return null;
                });
        }

        function GetClaimByUser(username, callback) {
            $http.get(apiDomain + apiVersion + '/claim/username/' + username, config)
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
    }

})();