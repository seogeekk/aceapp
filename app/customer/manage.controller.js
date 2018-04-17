(function (){
    'use strict';

    angular
        .module('app')
        .controller('ManageCustomer.IndexController', Controller);

    function Controller($scope, $location, $state, $stateParams, $localStorage, StaffService, $timeout) {
        var vm = this;

        vm.submit = submit;

        vm.alert = '';
        vm.error = '';
        initController();

        function initController() {

            // Initialise variables
            vm.searcherror = undefined;
            vm.username = $localStorage.currentUser.username;
            vm.custname = $localStorage.currentUser.firstname + ' ' + $localStorage.currentUser.lastname;
            vm.roleid = $localStorage.currentUser.roleid;

            $scope.isAdmin=function() {
                if(vm.roleid == 1) {
                    return true;
                }
                return false;
            }
            // Fill in Staff Details
            // If it's update else / Create New
            if ($stateParams.staffusername) {
                vm.staffusername = $stateParams.staffusername;
                StaffService.GetStaffDetails(vm.staffusername)
                    .then(function (response) {
                        if(response) {
                            vm.staffid = response.staffid;
                            var staffname = response.staffname.split(/(\s+)/).filter( function(e) { return e.trim().length > 0; } );
                            vm.firstname = staffname[0];
                            vm.lastname = staffname[1];
                            vm.accesstype = {accesstypename: response.accesstype.name, accesstypeid: response.accesstype.typeid};
                            vm.department = {departmentname: response.department.name, departmentid: response.department.id};
                            vm.email = response.emailaddress;
                        } else {
                            alert("Staff not found!");
                            $state.go("staff");
                        }
                    });
            } else {
                // Redirect staff & customer
                if (!$scope.isAdmin()) {
                    $state.go("staff");
                }
            }

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

            StaffService.GetUserTypes()
                .then(function(response) {
                    if (response.constructor === Array) {
                        vm.usertypes = response;
                    }
                });

        };

        $scope.hideForm=function() {
            $state.go("staff");
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

            var StaffDetails = {
                username: vm.staffusername,
                department: vm.department.departmentid,
                accesstype: vm.accesstype.accesstypeid
            };

            if (vm.staffid) {
                // if update staff, assign staffid
                StaffDetails.staffid = vm.staffid;
                StaffDetails.staffname = vm.firstname + ' ' + vm.lastname;

                StaffService.UpdateStaff(StaffDetails, function(results, response){
                        if (results == true) {
                            vm.alert = "Staff successfully updated!";
                            $timeout(function() {
                                vm.alertmessage = undefined;
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

                StaffDetails.roleid = vm.usertype.usertypeid;
                StaffDetails.firstname= vm.firstname;
                StaffDetails.lastname= vm.lastname;
                StaffDetails.emailaddress = vm.email;
                StaffDetails.password = password;

                StaffService.CreateStaff(StaffDetails, function(results, response) {
                    if (results == true) {
                        vm.staffid = response.id;
                        vm.alert = "Staff successfully added!";
                        $timeout(function() {
                            vm.alertmessage = undefined;
                        }, 3000);
                        vm.loading = false;

                        // Prompt user with auto-generated password
                        alert("Password: " + password);
                        $state.go("managestaff", {staffusername: vm.staffusername});
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