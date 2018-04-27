(function (){
    'use strict';

    angular
        .module('app')
        .controller('ManageCustomer.IndexController', Controller);

    function Controller($scope, $location, $state, $stateParams, $localStorage, CustomerService, AddressService, UserService, $timeout, NgTableParams) {
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

                            UserService.GetUserStatus(vm.customerusername)
                                .then(function(response) {
                                    vm.userstatus = response;
                                });

                            // If we've got a customer, load all claims
                            CustomerService.GetAllClaims( vm.customerusername, function(result, data) {

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

            UserService.GetUserStatuses()
                .then(function(response) {
                    if (response.constructor === Array) {
                        vm.userstatuses = response;
                    }
                });

        };


        $scope.resetPassword =function() {
            vm.resetloading = true;

            var password = randomPassword();
            var UserDetails = {
                username: vm.customerusername,
                password: password
            };
            UserService.ResetPassword(UserDetails, function(result, response) {
                if (result) {
                    // Prompt user with auto-generated password
                    alert("Password: " + password);
                    vm.resetloading = false;
                } else {
                    alert("Error resetting password");
                    vm.resetloading = false;
                }
            }, function(response) {
                alert("Error resetting password");
                vm.resetloading = false;
            });
        }

        $scope.changeUserStatus=function() {
            vm.statusloading = true;
            vm.statuserror = undefined;
            vm.statusalert = undefined;

            var UserDetails = {
                username: vm.customerusername,
                status: vm.userstatus.userstatusid
            };
            UserService.ChangeUserStatus(UserDetails, function(result, response) {
                if (result) {
                    vm.statusalert = "User status updated!";
                    $timeout(function() {
                        vm.statusalert = undefined;
                    }, 3000);
                    vm.statusloading = false;
                } else {
                    vm.statuserror = "Error updating status";
                    vm.statusloading = false;
                }
            }, function(response) {
                vm.statuserror = "Error updating status";
                vm.statusloading = false;
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
                firstname: vm.firstname,
                lastname: vm.lastname,
                customername: [vm.firstname, vm.lastname].join(' '),
                mobilenumber: vm.mobile,
                emailaddress: vm.email
            };


            if (vm.customerid) {
                // if update customer, assign customerid
                CustDetails.customerid = vm.customerid;
                CustDetails.custname = vm.firstname + ' ' + vm.lastname;

                if (vm.property) {
                    // Get property details
                    AddressService.CompleteAddress(vm.property)
                        .then(function (response) {
                            if (response) {
                                CustDetails.address1= response.address1;
                                CustDetails.address2= response.address2;
                                CustDetails.suburb= response.suburb;
                                CustDetails.state= response.state;
                                CustDetails.postcode=response.postcode;
                                CustDetails.country= 'AUSTRALIA';
                            }

                            // Update customer
                            CustomerService.UpdateCustomer(CustDetails, function(results, response){
                                if (results == true) {
                                    // Update user-related
                                    UserService.UpdateUser(CustDetails, function(results, response){
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
                                    // Return callback error
                                    vm.error = 'Something went wrong!';
                                    vm.loading = false;
                                }
                            });
                        });
                } else {
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
                }

            } else {
                // if create user, assign role
                var password = randomPassword();

                CustDetails.roleid = CUSTROLEID;
                CustDetails.firstname= vm.firstname;
                CustDetails.lastname= vm.lastname;
                CustDetails.emailaddress = vm.email;
                CustDetails.password = password;
                CustDetails.customertype = vm.custtype;
                CustDetails.mobilenumber = vm.mobile;

                if (vm.property) {
                    // Get property details
                    AddressService.CompleteAddress(vm.property)
                        .then(function (response) {
                            if (response) {
                                CustDetails.address = {
                                    address1: response.address1,
                                    address2: response.address2,
                                    suburb: response.suburb,
                                    state: response.state,
                                    postcode: response.postcode,
                                    country: 'AUSTRALIA'
                                }
                            }

                            // Create Customer
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
                        });
                } else {
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



            }

        };

    }
})();