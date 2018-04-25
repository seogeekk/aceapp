(function () {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', function($localStorage, $scope) {
            var vm = this;

            $scope.isApprover = function() {
                if (vm.roleid == 1 || vm.roleid == 2) {
                    return true;
                }
                return false;
            }
            $scope.isAdmin = function() {
                if (vm.roleid == 1 ) {
                    return true;
                }
                return false;
            }
            $scope.isStaff=function() {
                if (vm.roleid == 4) {
                    return false;
                }
                return true;
            }

            initController();

            function initController() {
                vm.username = $localStorage.currentUser.username;
                vm.profilename = $localStorage.currentUser.firstname + ' ' + $localStorage.currentUser.lastname;
                vm.roleid = $localStorage.currentUser.roleid;

            }


        });


})();