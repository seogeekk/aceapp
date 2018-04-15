(function (){
    'use strict';

    angular
        .module('app')
        .controller('Workitem.IndexController', Controller);

    function Controller($scope, $state, $location, $timeout, $stateParams, InspectionService, $sce) {
        var vm = this;

        initController();

        vm.accept = accept;
        vm.reject = reject;

        var gmapkey = 'AIzaSyD3qhwd9SE9xA2jrg6VxCruSg2DCNkADGQ';

        function initController() {
            vm.token = $stateParams.token;

            loadDetails(vm.token);

            $scope.responded = function() {
                if (vm.response == 1) {
                    vm.responsename = 'Accepted';
                } else if (vm.response == 0) {
                    vm.responsename = 'Rejected';
                } else {
                    return true;
                }

                return false;
            }

            $scope.isCurrent = function() {
                if (vm.valid == 1) {
                    return true;
                }
                return false;
            }
        }

        function loadDetails(token) {
            InspectionService.GetInspectionByToken(token, function(result, response) {
                if (result) {
                    vm.inspectionid = response.inspectionid;
                    vm.valid = response.valid;
                    vm.response = response.response;
                    vm.responsedate = response.responsedate;
                    vm.inspectiondate = response.inspectiondate;
                    vm.claimid = response.claimid;
                    vm.summary = response.description;
                    vm.property = response.address1 + ' ' + response.address2 + ' ' + response.suburb + ' ' + response.state + ' ' + response.postcode;
                    vm.latitude = response.latitude;
                    vm.longitude = response.longitude;
                    vm.mapurl = $sce.trustAsResourceUrl('https://www.google.com/maps/embed/v1/place?key=' + gmapkey + '&q= '+ vm.property + '&center=' + vm.latitude + ',' + vm.longitude);
                } else {
                    alert('Inspection request not found!');
                    $location.path("/");
                }
            });
        }

        function accept() {
            vm.loading = true;
            vm.error = undefined;

            var payload = {
                inspectionid: vm.inspectionid,
                response: 1
            };

            // call update response service
            InspectionService.UpdateInspectionResponse(vm.token, payload, function(result, response) {
                if (result) {
                    vm.loading = false;
                    vm.alert = "Response submitted!";
                    $timeout(function() {
                        vm.alert = undefined;
                    }, 3000);
                    // update details
                    vm.response = 1;
                } else {
                    vm.error = "Something went wrong!";
                    vm.loading = false;
                }
            }, function(response) {
                vm.error = "Something went wrong!";
                vm.loading = false;
            });
        }

        function reject() {
            vm.loading = true;
            vm.error = undefined;

            var payload = {
                inspectionid: vm.inspectionid,
                response: 0
            };

            // call update response service
            InspectionService.UpdateInspectionResponse(vm.token, payload, function(result, response) {
                if (result) {
                    vm.loading = false;
                    vm.alert = "Response submitted!";
                    $timeout(function() {
                        vm.alert = undefined;
                    }, 3000);
                    // update details
                    vm.response = 0;
                } else {
                    vm.error = "Something went wrong!";
                    vm.loading = false;
                }
            }, function(response) {
                vm.error = "Something went wrong!";
                vm.loading = false;
            });
        }

    }
})();