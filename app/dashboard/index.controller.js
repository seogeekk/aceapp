(function (){
    'use strict';

    angular
        .module('app')
        .controller('Dashboard.IndexController', Controller);

    function Controller($scope, $state, $location, $timeout, $localStorage, DashboardService) {
        var vm = this;


        initController();

        function initController() {


            vm.username = $localStorage.currentUser.username;
            vm.profilename = $localStorage.currentUser.firstname + ' ' + $localStorage.currentUser.lastname;
            vm.roleid = $localStorage.currentUser.roleid;

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

            $scope.allrequests = 0;
            $scope.openrequests = 0;
            $scope.allapprovals = 0;
            $scope.allproperties = 0;
            $scope.myapprovals = 0;
            $scope.myrequests = 0;
            $scope.myinspections = 0;
            $scope.myproperties = 0;

            if($scope.isStaff()) {
                DashboardService.GetStaffDashboard(vm.username, function(results, response) {

                    if (results == true) {
                        $scope.allrequests = response.allrequests;
                        $scope.openrequests = response.openrequests;
                        $scope.allapprovals = response.allapprovals;
                        $scope.allproperties = response.allproperties;
                        $scope.myapprovals = response.forapprovals;
                        $scope.myrequests = response.requests;
                        $scope.myinspections = response.inspections;
                        $scope.myproperties = response.properties;
                    }
                });

                DashboardService.GetStaffCalendar(vm.username, function(results, response) {
                    $scope.calendarlist = response;
                });

            } else {
                DashboardService.GetUserDashboard(vm.username, function(results, response) {
                    if (results == true) {
                        $scope.openrequests = response.allrequests;
                        $scope.myrequests = response.requests;
                        $scope.myinspections = response.inspections;
                        $scope.myproperties = response.properties;
                    }
                })
            }

            $scope.notificationlist = undefined;
        };



    }
})();