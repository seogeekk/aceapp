(function (){
    'use strict';

    angular
        .module('app')
        .controller('Claim.IndexController', function(ClaimService, $scope, $state, $filter, $localStorage, NgTableParams){

            var vm = this;
            initController();

            function initController() {
                // Initialise variables
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
                    if(vm.roleid ==4) {
                        return false;
                    }
                    return true;
                }

                ClaimService.GetAllClaims(function(result, data) {

                    if(result == false) {
                        data = [];
                        vm.tableParams = new NgTableParams({
                            page: 1,
                            count: 25
                        }, {
                            dataset: data
                        });
                    } else {
                        var filter = {
                            submitteduser: undefined
                        }
                        if($scope.isCustomer()) {
                            filter.submitteduser = vm.username
                        }
                        vm.tableParams = new NgTableParams({
                            page: 1,
                            count: 25,
                            filter: filter
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
            }

        });
})();
