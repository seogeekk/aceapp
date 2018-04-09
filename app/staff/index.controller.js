(function (){
    'use strict';

    angular
        .module('app')
        .controller('Staff.IndexController', function(StaffService, $scope, $state, $filter, $localStorage, NgTableParams){

            var vm = this;
            initController();

            function initController() {
                // Initialise variables
                vm.username = $localStorage.currentUser.username;
                vm.profilename = $localStorage.currentUser.firstname + ' ' + $localStorage.currentUser.lastname;
                vm.roleid = $localStorage.currentUser.roleid;

                $scope.isAdmin=function() {
                    if(vm.roleid ==1) {
                        return true;
                    }
                    return false;
                }

                if(! $scope.isAdmin()) {
                    $state.go("home");
                }

                StaffService.GetAllStaff(function(result, data) {

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
                            count: 25
                        }, {
                            dataset: data
                        });
                    }
                });


                $scope.viewStaff = function(staffusername) {
                    $state.go('managestaff', { staffusername: staffusername });
                }

                $scope.getDTypes = function() {
                    return StaffService.GetDeparments()
                        .then(function(response) {

                            if(response) {
                                var departments = [];
                                for (var i = 0; i < response.length; i++) {
                                    var item = { id: response[i].departmentid, title: response[i].departmentname };
                                    departments.push(item);
                                }
                                return departments;
                            } else {
                                return null;
                            }
                        });
                }

                $scope.getATypes = function() {
                    return StaffService.GetAccessTypes()
                        .then(function(response) {

                            if(response) {
                                var accesstypes = [];
                                for (var i = 0; i < response.length; i++) {
                                    var item = { id: response[i].accesstypeid, title: response[i].accesstypename };
                                    accesstypes.push(item);
                                }
                                return accesstypes;
                            } else {
                                return null;
                            }
                        });
                }
            }

        });
})();
