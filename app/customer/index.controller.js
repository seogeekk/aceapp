(function (){
    'use strict';

    angular
        .module('app')
        .controller('Customer.IndexController', function(CustomerService, $scope, $state, $filter, $localStorage, NgTableParams){

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

                CustomerService.GetAllCustomer(function(result, data) {

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


                $scope.viewCustomer = function(username) {
                    $state.go('managecustomer', { customerusername: username });
                }

                $scope.getCTypes = function() {
                    return CustomerService.GetCustomerTypes()
                        .then(function(response) {

                            if(response) {
                                var customertypes = [];
                                for (var i = 0; i < response.length; i++) {
                                    var item = { id: response[i].custtypeid, title: response[i].custtypename };
                                    customertypes.push(item);
                                }
                                return customertypes;
                            } else {
                                return null;
                            }
                        });
                }

            }

        });
})();
