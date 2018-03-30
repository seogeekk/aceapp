(function (){
    'use strict';

    angular
        .module('app')
        .controller('Customer.IndexController', Controller);

    function Controller($scope, $location, $localStorage, CustomerService, AddressService) {
        var vm = this;

        vm.submit = submit;

        initController();

        function initController() {

            vm.username = $localStorage.currentUser.username;
            vm.custname = $localStorage.currentUser.firstname + ' ' + $localStorage.currentUser.lastname;

            // Fill in Customer Details
            CustomerService.GetCustomerDetails(vm.username)
                .then(function (response) {
                    vm.customerid = response.customerid;
                    vm.custtype = {custtypename: response.customertype.name, custtypeid: response.customertype.typeid};
                    vm.property = response.address1 + ' ' + response.address2 + ' ' + response.suburb + ' ' + response.state + ' ' + response.postcode
                });

            vm.custtypes = [];
            CustomerService.GetCustomerTypes()
                .then(function(response) {
                    if (response.constructor === Array) {
                        vm.custtypes = response;
                    }
                });

            $scope.complete=function(string){
                 AddressService.SearchAddress(string)
                    .then(function(response) {
                        $scope.addresslist=response;
                    });
            }
            $scope.fillTextbox=function(string){
                vm.property=string;
                $scope.addresslist=null;
            }
        };

        function submit() {
            vm.loading = true;

            AddressService.CompleteAddress(vm.property)
                .then(function(response) {
                    var address = response;

                    var UserDetails = {
                        customertypeid: vm.custtype.custtypeid,
                        custclass: "", // Need to add option to add
                        customername: vm.custname,
                        username: vm.username,
                        address1: address.address1,
                        address2: address.address2,
                        suburb: address.suburb,
                        state: address.state,
                        postcode: address.postcode,
                        country: 'AUSTRALIA'
                    }

                    CustomerService.CustomerExists(vm.username)
                        .then(function(response) {
                            var custid = response;

                            if(custid) {
                                UserDetails.customerid = custid;
                                CustomerService.UpdateCustomer(UserDetails, function (result, response) {
                                    if (result == true) {
                                        $location.path('/');
                                    } else {
                                        console.log(response);
                                        // Return callback error
                                        if(response.code == 'ER_DUP_ENTRY') {
                                            vm.error = 'Username already taken';
                                        } else {
                                            vm.error = 'Something went wrong';
                                        }
                                        vm.loading = false;
                                    }
                                });

                            } else {
                                CustomerService.CreateCustomer(UserDetails, function (result, response) {
                                    if (result == true) {
                                        $location.path('/');
                                    } else {
                                        console.log(response);
                                        // Return callback error
                                        if(response.code == 'ER_DUP_ENTRY') {
                                            vm.error = 'Username already taken';
                                        } else {
                                            vm.error = 'Something went wrong';
                                        }
                                        vm.loading = false;
                                    }
                                });
                            }
                        });

                });

        };

    }
})();