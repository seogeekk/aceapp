(function () {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', function($localStorage, $scope) {
            var vm = this;

            initController();

            function initController() {
                vm.username = $localStorage.currentUser.username;
                vm.profilename = $localStorage.currentUser.firstname + ' ' + $localStorage.currentUser.lastname;
                vm.roleid = $localStorage.currentUser.roleid;
            }

            $scope.isStaff=function() {
                if (vm.roleid == 4) {
                    return false;
                }
                return true;
            }
        });


})();