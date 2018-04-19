(function (){
    'use strict';

    angular
        .module('app')
        .controller('ManageCustomer.IndexController', Controller);

    function Controller($scope, $location, $state, $stateParams, $localStorage, CustomerService, AddressService, $timeout) {
        var vm = this;

        vm.submit = submit;

        var CUSTROLEID = 4;
        vm.alert = undefined;
        vm.error = undefined;
        initController();

        function initController() {

            // Initialise variables
            vm.searcherror = undefined;
            vm.username = $localStorage.currentUser.username;
            vm.custname = $localStorage.currentUser.firstname + ' ' + $localStorage.currentUser.lastname;
            vm.roleid = $localStorage.currentUser.roleid;

            $scope.isStaff=function() {
                if(vm.roleid == CUSTROLEID) {
                    return false;
                }
                return true;
            }
            // Fill in Customer Details
            // If it's update else / Create New
            if ($stateParams.customerusername) {
                vm.customerusername = $stateParams.customerusername;
                CustomerService.GetCustomerDetails(vm.customerusername)
                    .then(function (response) {
                        if(response) {
                            vm.customerid = response.customerid;
                            if (response.customername) {
                                var custname = response.customername.split(/(\s+)/).filter( function(e) { return e.trim().length > 0; } );
                                vm.firstname = custname[0];
                                vm.lastname = custname[1];
                            } else {
                                vm.firstname = undefined;
                                vm.lastname = undefined;
                            }
                            vm.custtype = {custtypeid: response.customertype.typeid, custtypename: response.customertype.name};
                            vm.email = response.emailaddress;
                            vm.mobile = response.mobilenumber;
                            vm.property = [response.address1, response.address2, response.suburb, response.state, response.postcode].join(' ');
                        } else {
                            alert("Customer not found!");
                            $state.go("customer");
                        }
                    });
            } else {
                // Redirect customer
                if (!$scope.isStaff()) {
                    $state.go("customer");
                }
            }

            CustomerService.GetCustomerTypes()
                .then(function(response) {
                    if (response.constructor === Array) {
                        vm.custtypes = response;
                    }
                });

        };

        $scope.hideForm=function() {
            $state.go("customer");
        }

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

        function randomPassword() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 6; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        }

        function submit() {
            vm.loading = true;

            vm.error = undefined;
            vm.alert = undefined;

            var CustDetails = {
                username: vm.customerusername,
                customertypeid: vm.custtype.custtypeid,
                customername: [vm.firstname, vm.lastname].join(' ')
            };

            if (vm.customerid) {
                // if update customer, assign customerid
                CustDetails.customerid = vm.customerid;
                CustDetails.custname = vm.firstname + ' ' + vm.lastname;

                CustomerService.UpdateCustomer(CustDetails, function(results, response){
                        if (results == true) {
                            vm.alert = "Customer successfully updated!";
                            $timeout(function() {
                                vm.alert = undefined;
                            }, 3000);
                            vm.loading = false;
                        } else {
                            // Return callback error
                            vm.error = 'Something went wrong!';
                            vm.loading = false;
                        }
                    });
            } else {
                // if create user, assign role
                var password = randomPassword();

                CustDetails.roleid = CUSTROLEID;
                CustDetails.firstname= vm.firstname;
                CustDetails.lastname= vm.lastname;
                CustDetails.emailaddress = vm.email;
                CustDetails.password = password;

                CustomerService.CreateCustomer(CustDetails, function(results, response) {
                    if (results == true) {
                        vm.customerid = response.id;
                        vm.alert = "Customer successfully added!";
                        $timeout(function() {
                            vm.alert = undefined;
                        }, 3000);
                        vm.loading = false;

                        // Prompt user with auto-generated password
                        alert("Password: " + password);
                        $state.go("managecustomer", {customerusername: vm.customerusername});
                    } else {
                        // Return callback error
                        if(response.code == 'ER_DUP_ENTRY') {
                            vm.error = 'Username already exists';
                        } else {
                            vm.error = 'Something went wrong!';
                        }
                        vm.loading = false;
                    }
                })
            }

        };

    }
})();