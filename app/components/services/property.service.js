(function() {
    'use strict';

    angular
        .module('app')
        .factory('PropertyService', Service);

    function Service($http, $localStorage) {
        var service = {};

        service.CreateProperty = CreateProperty;
        service.GetPropertyTypes = GetPropertyTypes;
        service.PropertyExists = PropertyExists;
        service.UpdateProperty = UpdateProperty;
        service.GetPropertyDetails = GetPropertyDetails;
        service.GetPropertyByCanonical = GetPropertyByCanonical;
        service.GetAllProperties = GetAllProperties;


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

        function GetPropertyTypes() {

            var CUSTTYPE_GID = 9;

            return $http.get(apiDomain + apiVersion + '/config/' + CUSTTYPE_GID, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.config.length > 0) {

                        var propertytypes = [];
                        for (var i = 0; i < payload.config.length; i++) {
                            var item = { propertytypeid: payload.config[i].ordinal, propertytypename: payload.config[i].longdesc };
                            propertytypes.push(item);
                        }
                        return propertytypes;
                    } else {
                        return null;
                    }
                }, function(response) {
                    return null;
                });
        }

        function CreateProperty(PropertyDetails, callback) {
            return $http.post(apiDomain + apiVersion + '/property/new', PropertyDetails, config)
                .then( function (response) {
                    // login successful if there's a token in the reponse
                    var payload = response.data;
                    if(payload.success) {
                        callback(true,payload.property);
                    } else {
                        callback(false);
                    }
                }, function(response) {
                    callback(false,response);
                });
        }

        function UpdateProperty(PropertyDetails, callback) {
            return $http.post(apiDomain + apiVersion + '/property/update', PropertyDetails, config)
                .then( function (response) {
                    // login successful if there's a token in the reponse
                    var payload = response.data;
                    if(payload.success) {
                        callback(true,payload.property);
                    } else {
                        callback(false);
                    }
                }, function(response) {
                    callback(false,response);
                });
        }

        function PropertyExists(propertyid) {
            return $http.get(apiDomain + apiVersion + '/property/' + propertyid, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        return payload.property.propertyid;
                    } else {
                        return null;
                    }
                }, function(response) {
                    return null;
                });
        }

        function GetAllProperties(callback) {
            return $http.get(apiDomain + apiVersion + '/property/', config)
                .then( function (response) {

                    var payload = response.data;
                    if(payload.success) {
                        callback(true,payload.properties);
                    } else {
                        callback(false);
                    }
                }, function(response) {
                    callback(false,response);
                });
        }

        function GetPropertyDetails(propertyid) {
            return $http.get(apiDomain + apiVersion + '/property/' + propertyid, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        return payload.property;
                    } else {
                        return null;
                    }
                }, function(response) {
                    return null;
                });
        }

        function GetPropertyByCanonical(canonicalid) {
            return $http.get(apiDomain + apiVersion + '/property/canonical/' + canonicalid, config)
                .then( function (response) {

                    var payload = response.data;

                    if(payload.success) {
                        return payload.property;
                    } else {
                        return null;
                    }
                }, function(response) {
                    return null;
                });
        }
    }

})();