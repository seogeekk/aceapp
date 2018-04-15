(function (){
    'use strict';

    angular
        .module('app')
        .controller('Dashboard.IndexController', Controller);

    function Controller($scope, $state, $location, $timeout, $localStorage, CustomerService, AddressService, StaffService, UserService) {
        var vm = this;


        initController();

        function initController() {


            vm.username = $localStorage.currentUser.username;
            vm.profilename = $localStorage.currentUser.firstname + ' ' + $localStorage.currentUser.lastname;
            vm.roleid = $localStorage.currentUser.roleid;

            $scope.isCustomer=function() {
                if (vm.roleid == 4) {
                    return true;
                }
                return false;
            }

            $scope.isStaff=function() {
                if (vm.roleid != 4) {
                    return true;
                }
                return false;
            }

            $scope.notAdmin=function() {
                if (vm.roleid == 1) {
                    return false;
                }
                return true;
            }

            $scope.hideForm=function() {
                $state.go("home");
            }
        };



    }
})();