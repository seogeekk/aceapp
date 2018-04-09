(function (){
    'use strict';

    angular
        .module('app')
        .controller('ManageProperty.IndexController', Controller);

    function Controller($scope, $location, $state, $stateParams, $localStorage, CustomerService, AddressService, PropertyService, $timeout) {
        var vm = this;

        vm.submit = submit;

        vm.alertmessage = "";
        initController();

        function initController() {

            // Initialise variables
            vm.searcherror = undefined;
            vm.username = $localStorage.currentUser.username;
            vm.custname = $localStorage.currentUser.firstname + ' ' + $localStorage.currentUser.lastname;
            vm.roleid = $localStorage.currentUser.roleid;

            $scope.isStaff=function() {
                if (vm.roleid == 4) {
                    return false;
                }
                return true;
            }

            $scope.isCustomer=function() {
                if(vm.roleid == 4) {
                    return true;
                }
                return false;
            }
            // Fill in PropertyDetails
            // If it's update else / Create New
            if ($stateParams.propertyid) {
                vm.propertyid = $stateParams.propertyid;
                PropertyService.GetPropertyDetails(vm.propertyid)
                    .then(function (response) {
                        if(response) {
                            vm.propertyid = response.propertyid;
                            vm.canonicalid = response.canonicalid;
                            vm.property = response.address1 + ' ' + response.address2 + ' ' + response.suburb + ' ' + response.state + ' ' + response.postcode;
                            vm.addressone = response.address1;
                            vm.addresstwo = response.address2;
                            vm.suburb = response.suburb;
                            vm.state = response.state;
                            vm.postcode = response.postcode;
                            vm.country = response.country;
                            vm.propertytype = {propertytypename: response.propertytype.name, propertytypeid: response.propertytype.typeid};
                        } else {
                            alert("Property not found!");
                            $state.go("property");
                        }
                    });
            } else {
                // Redirect customer
                if ($scope.isCustomer()) {
                    $state.go("property");
                }
            }

            vm.custtypes = [];
            PropertyService.GetPropertyTypes()
                .then(function(response) {
                    if (response.constructor === Array) {
                        vm.propertytypes = response;
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

            $scope.populateFields=function() {
                AddressService.CompleteAddress(vm.property)
                    .then(function(response) {
                        var address = response;

                        vm.canonicalid = address.property_canonical_address;
                        vm.searcherror = undefined;
                        vm.addressone = address.address1;
                        vm.addresstwo = address.address2;
                        vm.suburb = address.suburb;
                        vm.state = address.state;
                        vm.postcode = address.postcode;
                        vm.country = "AUSTRALIA";
                        vm.latitude = address.latitude;
                        vm.longitude = address.longitude;
                        vm.unit_type = address.unit_type;
                        vm.mesh_block = address.mesh_block;
                    }, function(response) {
                        vm.searcherror = "Address not found";
                    });
            }


        };

        $scope.hideForm=function() {
            $state.go("property");
        }
        function submit() {
            vm.loading = true;

            vm.error = undefined;
            vm.alertmessage = undefined;

            if (vm.propertyid) {
                PropertyService.PropertyExists(vm.propertyid)
                    .then(function(response) {
                        var propertyid = response;

                        var PropertyDetails = {
                            propertyid: propertyid,
                            property_canonical_id: vm.canonicalid,
                            address1: vm.addressone,
                            address2: vm.addresstwo,
                            suburb: vm.suburb,
                            state: vm.state,
                            postcode: vm.postcode,
                            country: vm.country,
                            latitude: vm.latitude,
                            longitude: vm.longitude,
                            unit_type: vm.unit_type,
                            mesh_block: vm.mesh_block,
                            propertytype: vm.propertytype.propertytypeid
                        };

                        PropertyService.UpdateProperty(PropertyDetails, function(results, response) {
                            if (results == true) {
                                vm.alertmessage = "Property successfully updated!";
                                $timeout(function() {
                                    vm.alertmessage = undefined;
                                }, 3000);
                                vm.loading = false;
                            } else {
                                // Return callback error
                                if(response.data.code == 'ER_DUP_ENTRY') {
                                    vm.error = 'Property already exists';
                                } else {
                                    vm.error = 'Something went wrong!';
                                }
                                vm.loading = false;
                            }
                        });
                    });
            } else {
                // Create property
                var PropertyDetails = {
                    property_canonical_id: vm.canonicalid,
                    address1: vm.addressone,
                    address2: vm.addresstwo,
                    suburb: vm.suburb,
                    state: vm.state,
                    postcode: vm.postcode,
                    country: vm.country,
                    latitude: vm.latitude,
                    longitude: vm.longitude,
                    unit_type: vm.unit_type,
                    mesh_block: vm.mesh_block,
                    propertytype: vm.propertytype.propertytypeid
                };

                PropertyService.CreateProperty(PropertyDetails, function(results, response) {
                    if (results == true) {
                        vm.canonicalid = response.property_canonical_id;
                        vm.propertyid = response.propertyid;
                        vm.alertmessage = "Property successfully added!";
                        $timeout(function() {
                            vm.alertmessage = undefined;
                        }, 3000);
                        vm.loading = false;
                    } else {
                        // Return callback error
                        if(response.data.code == 'ER_DUP_ENTRY') {
                            vm.error = 'Property already exists';
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