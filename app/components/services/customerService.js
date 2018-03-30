'use strict';

angular.module('myApp.version.version-directive', [])

    .service('Customer1Service', ['$http', '$q', function($http, $q) {
        var apiDomain = 'http://localhost:3000';

        var getToken = function () {
          return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MTk1MjEwNTA1MjV9.0_LPdbhzHERcqYzXPBJw-q-JaS8CfotbwwuNCLuW-h8';
        };

        var getCustomer = function (customerNumber) {
            var url = apiDomain + '/api/v1/customer/getdetails/' + customerNumber,
                token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MTk1MjEwNTA1MjV9.0_LPdbhzHERcqYzXPBJw-q-JaS8CfotbwwuNCLuW-h8';

            var deferred = $q.defer(),
                config = {
                    headers: {
                        'content-type': 'application/json',
                        'x-access-token': token,
                        'x-key': 'karezb'
                    }
                };

            $http.get(url, config).then(
                function (response) {
                    deferred.resolve(response.data);
                },
            function (error) {
                    console.log(error);
                deferred.reject({});
            }
            );

            // transformResponse: [function (data) {
            //     try{
            //         return JSON.parse(data);
            //     } catch(error) {
            //         console.log(error);
            //         return '';
            //     }
            // }],
            //     headers: {
            //     'content-type': 'application/json',
            //         'x-access-token': token,
            //         'x-key': 'karezb'
            // }

            return deferred.promise

        };

        return {
            getCustomer: getCustomer
        };
    }]);
