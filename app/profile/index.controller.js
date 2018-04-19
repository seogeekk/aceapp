(function (){
    'use strict';

    angular
        .module('app')
        .controller('UserProfile.IndexController', Controller);

    function Controller($scope, $state, $location, $timeout, $localStorage, CustomerService, AddressService, StaffService, UserService) {
        var vm = this;

        vm.submit = submit;

        initController();

        function initController() {


            vm.username = $localStorage.currentUser.username;
            vm.profilename = $localStorage.currentUser.firstname + ' ' + $localStorage.currentUser.lastname;
            vm.roleid = $localStorage.currentUser.roleid;

            if (vm.roleid == 4) {
                // Fill in Customer Details
                CustomerService.GetCustomerDetails(vm.username)
                    .then(function (response) {
                        vm.profileid = response.customerid;
                        vm.custtype = {custtypename: response.customertype.name, custtypeid: response.customertype.typeid};
                        vm.property = [response.address1, response.address2, response.suburb, response.state, response.postcode].join(' ');
                        vm.email = response.emailaddress;
                        vm.mobile = response.mobilenumber;
                    });
            } else {
                StaffService.GetStaffDetails(vm.username)
                    .then(function (response) {
                        vm.profileid = response.staffid;
                        vm.accesstype = {accesstypename: response.accesstype.name, accesstypeid: response.accesstype.typeid};
                        vm.department = {departmentname: response.department.name, departmentid: response.department.id};
                        vm.email = response.emailaddress;
                        vm.mobile = response.mobilenumber;
                    });
            }

            vm.custtypes = [];
            CustomerService.GetCustomerTypes()
                .then(function(response) {
                    if (response.constructor === Array) {
                        vm.custtypes = response;
                    }
                });

            StaffService.GetDeparments()
                .then(function(response) {
                    if (response.constructor === Array) {
                        vm.departments = response;
                    }
                });

            StaffService.GetAccessTypes()
                .then(function(response) {
                    if (response.constructor === Array) {
                        vm.accesstypes = response;
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

            $scope.isCustomer=function() {
                if (vm.roleid == 4) {
                    return true;
                }
                return false;
            }

            $scope.isStaff=function() {
                if (vm.roleid != 4) {
                    return true;
                }
                return false;
            }

            $scope.notAdmin=function() {
                if (vm.roleid == 1) {
                    return false;
                }
                return true;
            }

            $scope.hideForm=function() {
                $state.go("home");
            }
        };

        function submit() {
            vm.loading = true;
            vm.error = '';

            if ($scope.isCustomer()) {
                updateCustomer();
            } else {
                updateStaff();
            }

        };

        function updateCustomer() {

            AddressService.CompleteAddress(vm.property)
                .then(function(response) {
                    var address = response;

                    var CustomerDetails = {
                        customerid: vm.profileid,
                        username: vm.username,
                        customertypeid: vm.custtype.custtypeid,
                        custclass: "", // Need to add option to add
                        customername: vm.custname
                    };

                    // if address is found
                    if (address) {
                        CustomerDetails.address1 = address.address1;
                        CustomerDetails.address2 = address.address2;
                        CustomerDetails.suburb = address.suburb;
                        CustomerDetails.state = address.state;
                        CustomerDetails.postcode = address.postcode;
                        CustomerDetails.country = 'AUSTRALIA';
                    }
                    // Update customer & user
                    CustomerService.UpdateCustomer(CustomerDetails, function (result, response) {
                        if (result == true) {
                            // Update mobile number
                            var name = vm.profilename.split(/(\s+)/).filter( function(e) { return e.trim().length > 0; } );
                            var UserDetails = {
                                username: vm.username,
                                firstname: name[0],
                                lastname: name[1],
                                mobilenumber: vm.mobile,
                                emailaddress: vm.email
                            }

                            UserService.UpdateUser(UserDetails, function (result, response) {
                                if (result == true) {
                                    vm.alert = "Updated successfully!";
                                    vm.loading= false;
                                    $timeout(function() {
                                        vm.alert = undefined;
                                    }, 3000);
                                } else {
                                    console.log(response);
                                    // Return callback error
                                    vm.error = 'Something went wrong';
                                    vm.loading = false;
                                }
                            });
                        } else {
                            console.log(response);
                            // Return callback error
                            vm.error = 'Something went wrong';
                            vm.loading = false;
                        }
                    });
                });

        }

        function updateStaff() {
            var StaffDetails = {
                username: vm.username,
                staffname: vm.profilename,
                department: vm.department.departmentid,
                accesstype: vm.accesstype.accesstypeid
            }

            StaffService.UpdateStaff(StaffDetails, function (result, response) {
                if (result == true) {
                    // update mobile number
                    var name = vm.profilename.split(/(\s+)/).filter( function(e) { return e.trim().length > 0; } );
                    var UserDetails = {
                        staffid: vm.profileid,
                        username: vm.username,
                        firstname: name[0],
                        lastname: name[1],
                        mobilenumber: vm.mobile,
                        emailaddress: vm.email
                    }

                    UserService.UpdateUser(UserDetails, function (result, response) {
                        if (result == true) {
                            vm.alert = "Updated successfully!";
                            vm.loading= false;
                            $timeout(function() {
                                vm.alert = undefined;
                            }, 3000);
                        } else {
                            console.log(response);
                            // Return callback error
                            vm.error = 'Something went wrong';
                            vm.loading = false;
                        }
                    });
                } else {
                    console.log(response);
                    // Return callback error
                    vm.error = 'Something went wrong';
                    vm.loading = false;
                }
            });
        }

    }
})();