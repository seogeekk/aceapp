(function (){
    'use strict';

    angular
        .module('app')
        .controller('Property.IndexController', function(PropertyService, $scope, $state, $filter, $localStorage, NgTableParams){

            var vm = this;
            initController();

            function initController() {
                // Initialise variables
                vm.username = $localStorage.currentUser.username;
                vm.profilename = $localStorage.currentUser.firstname + ' ' + $localStorage.currentUser.lastname;
                vm.roleid = $localStorage.currentUser.roleid;
            }

            $scope.isCustomer=function() {
                if (vm.roleid == 4) {
                    return true;
                }
                return false;
            }

            $scope.isStaff=function() {
                if(vm.roleid ==4) {
                    return false;
                }
                return true;
            }

            if ($scope.isCustomer()) {
                PropertyService.GetAllPropertiesByUser(vm.username, function(result, data) {

                    if(result == false) {
                        data = [];
                        vm.tableParams = new NgTableParams({
                            page: 1,
                            count: 25
                        }, {
                            dataset: data
                        });
                    } else {

                        vm.tableParams = new NgTableParams({
                            page: 1,
                            count: 25,
                        }, {
                            dataset: data
                        });
                    }
                });
            } else {
                PropertyService.GetAllProperties(function(result, data) {

                    if(result == false) {
                        data = [];
                        vm.tableParams = new NgTableParams({
                            page: 1,
                            count: 25
                        }, {
                            dataset: data
                        });
                    } else {

                        vm.tableParams = new NgTableParams({
                            page: 1,
                            count: 25,
                        }, {
                            dataset: data
                        });
                    }
                });
            }




            $scope.viewProperty = function(propertyid) {
                $state.go('manageproperty', { propertyid: propertyid });
            }

            $scope.getPTypes = function() {
                return PropertyService.GetPropertyTypes()
                    .then(function(response) {

                        if(response) {
                            var propertytypes = [];
                            for (var i = 0; i < response.length; i++) {
                                var item = { id: response[i].propertytypeid, title: response[i].propertytypename };
                                propertytypes.push(item);
                            }
                            return propertytypes;
                        } else {
                            return null;
                        }
                    });
            }

            $scope.getSTypes = function() {
                return ClaimService.GetStatusTypes()
                    .then(function(response) {

                        if(response) {
                            var statustypes = [];
                            for (var i = 0; i < response.length; i++) {
                                var item = { id: response[i].statustypeid, title: response[i].statusname };
                                statustypes.push(item);
                            }
                            return statustypes;
                        } else {
                            return null;
                        }
                    });
            }


        });
})();
