(function (){
    'use strict';

    angular
        .module('app')
        .controller('Reports.IndexController', Controller);

    function Controller($scope, $state, $location, $timeout, $localStorage, NgTableParams, DashboardService) {
        var vm = this;


        initController();

        function initController() {


            vm.username = $localStorage.currentUser.username;
            vm.profilename = $localStorage.currentUser.firstname + ' ' + $localStorage.currentUser.lastname;
            vm.roleid = $localStorage.currentUser.roleid;




            $scope.$watch('vm.reportdate', function() {
                // Block Stat
                DashboardService.GetCompletionStat(vm.reportdate, function(results, response) {
                    $scope.allrequests = 0;
                    $scope.avgcompleted = 0;
                    $scope.pcntcompleted = 0;
                    $scope.avgduration = 0;

                    if(results == true) {
                        $scope.allrequests = response[0].allrequests;
                        $scope.avgcompleted = response[0].avgcompleted;
                        $scope.pcntcompleted = response[0].pcntcompleted;
                        $scope.avgduration = response[0].avgduration;
                    }
                });

                // Pie Chart
                DashboardService.GetSuburbStat(vm.reportdate, function(results, response) {
                    $scope.suburblabels = [];
                    $scope.suburbdata = [];

                    console.log(response);
                    if(results == true) {

                        var suburb = [];
                        var data = [];
                        angular.forEach(response, function(value, key) {
                            suburb.push(value.suburb);
                            data.push(value.allrequest);
                        });

                        $scope.suburblabels = suburb;
                        $scope.suburbdata = data;
                    }
                });

                DashboardService.GetRequestTypeStat(vm.reportdate, function(results, response) {
                    $scope.typelabels = [];
                    $scope.typedata = [];

                    if(results == true) {

                        var requesttype = [];
                        var data = [];
                        angular.forEach(response, function(value, key) {
                            requesttype.push(value.requesttype);
                            data.push(value.count);
                        });

                        $scope.typelabels = requesttype;
                        $scope.typedata = data;
                    }
                });

                // Bar Chart
                DashboardService.GetRequestCountStat(vm.reportdate, function(results, response) {
                    $scope.countlabels = ["Requests Logged", "Requests In-Progress", "Requests Cancelled", "Requests Rejected", "Requests Completed", "Completed <= 1d", "Completed <= 1w", "Completed > 1w"];
                    $scope.countdata = [];

                    if(results == true) {

                        $scope.countdata = [
                            response[0].allrequests,
                            response[0].openrequests,
                            response[0].cancelledrequests,
                            response[0].rejectedrequests,
                            response[0].closedrequests,
                            response[0].closed1d,
                            response[0].closed1w,
                            response[0].closedgt1w
                        ];
                    }
                });
            });



            // Request Table Stat
            $scope.$watch('vm.requestreportdate', function() {
                vm.tableRequestDuration = new NgTableParams({
                    page: 1,
                    count: 25,
                    filter: {}
                }, {
                    dataset: []
                });

                DashboardService.GetRequestDurationStat(vm.requestreportdate, function(results, response) {
                    if(results == true) {

                        vm.tableRequestDuration = new NgTableParams({
                            page: 1,
                            count: 25,
                            filter: {}
                        }, {
                            dataset: response
                        });
                    }
                });

                vm.tableRequestDuration.reload();
            });

            // Staff Table Stat
            $scope.$watch('vm.staffreportdate', function() {
                vm.tableStaffStat = new NgTableParams({
                    page: 1,
                    count: 25,
                    filter: {}
                }, {
                    dataset: []
                });

                DashboardService.GetStaffStat(vm.staffreportdate, function(results, response) {
                    if(results == true) {

                        vm.tableStaffStat = new NgTableParams({
                            page: 1,
                            count: 25,
                            filter: {}
                        }, {
                            dataset: response
                        });
                    }
                });

                vm.tableStaffStat.reload();
            });

            // Customer Table Stat
            $scope.$watch('vm.custreportdate', function() {
                vm.tableCustStat = new NgTableParams({
                    page: 1,
                    count: 25,
                    filter: {}
                }, {
                    dataset: []
                });

                DashboardService.GetCustomerStat(vm.custreportdate, function(results, response) {
                    if(results == true) {

                        vm.tableCustStat = new NgTableParams({
                            page: 1,
                            count: 25,
                            filter: {}
                        }, {
                            dataset: response
                        });
                    }
                });

                vm.tableCustStat.reload();
            });

        };



    }
})();