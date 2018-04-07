(function (){
    'use strict';

    angular
        .module('app')
        .controller('Claim.IndexController', function(ClaimService, $scope, $state, $filter, $localStorage, NgTableParams){

            $scope.adminuser = true;

            var vm = this;
            initController();

            function initController() {
                // Initialise variables
                vm.username = $localStorage.currentUser.username;
                vm.custname = $localStorage.currentUser.firstname + ' ' + $localStorage.currentUser.lastname;
                vm.roleid = $localStorage.currentUser.roleid;
            }

            ClaimService.GetClaimByUser(vm.username, function(result, data) {
                console.log(data);
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


            $scope.viewClaim = function(claimid) {
                $state.go('managerequest', { claimid: claimid });
            }

            $scope.getCTypes = function() {
                return ClaimService.GetClaimTypes()
                    .then(function(response) {

                        if(response) {
                            var claimtypes = [];
                            for (var i = 0; i < response.length; i++) {
                                var item = { id: response[i].claimtypeid, title: response[i].claimtypename };
                                claimtypes.push(item);
                            }
                            return claimtypes;
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
