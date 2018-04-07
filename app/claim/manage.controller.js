(function (){
    'use strict';

    angular
        .module('app')
        .controller('ManageClaim.IndexController', Controller);

    function Controller($scope, $state, $location, $stateParams, $localStorage, ClaimService, AddressService, PropertyService, WorklogService, $timeout) {
        var vm = this;

        // functions
        vm.submit = submit;
        vm.submitwork = submitwork;

        // global variables
        vm.snapshot = false;
        vm.editflag = true;

        initController();

        function initController() {

            // Initialise variables
            vm.alertmessage = '';
            vm.searcherror = '';
            vm.username = $localStorage.currentUser.username;
            vm.custname = $localStorage.currentUser.firstname + ' ' + $localStorage.currentUser.lastname;
            vm.roleid = $localStorage.currentUser.roleid;

            // Fill in Claim Details
            // If it's update else / Create New
            if ($stateParams.claimid) {

                vm.claimid = $stateParams.claimid;

                ClaimService.GetClaimDetails(vm.claimid)
                    .then(function (response) {
                        if(response) {

                            vm.claimid = response.claimid;
                            vm.claimtype = {claimtypename: response.claimtype.name, claimtypeid: response.claimtype.typeid};
                            vm.summary = response.summary;
                            vm.description = response.description;
                            vm.submitteddate = response.submitteddate;
                            vm.submitteduser = response.submitteduser;
                            // property related
                            vm.canonicalid = response.property.property_canonical_id;
                            vm.property = response.property.address1 + ' ' + response.property.address2 + ' ' + response.property.suburb + ' ' + response.property.state + ' ' + response.property.postcode;
                            vm.address1 = response.property.address1;
                            vm.address2 = response.property.address2;
                            vm.suburb = response.property.suburb;
                            vm.state = response.property.state;
                            vm.postcode = response.property.postcode;
                            vm.country = response.property.country;
                            vm.propertytype = {propertytypename: response.property.propertytype.name, propertytypeid: response.property.propertytype.typeid};

                            // other
                            vm.status = {statusname: response.status.statusname, statusid: response.status.statusid};

                            // Set form flags
                            vm.editflag = false;
                            vm.snapshot = true;
                        }
                    });

                console.log(vm.claimid);
                worklogHistory();
            } else {
                // This assumes it is a new claim
                vm.editflag = true;
            }

            $scope.toggleEdit = function() {
                vm.editflag = true;
                vm.snapshot = false;
            }

            $scope.toggleClose = function() {

                if(vm.claimid) {
                    vm.editflag = false;
                    vm.snapshot = true;
                    // close add worklog too
                    vm.workaddflag = false
                } else {
                    $state.go('request');
                }

            }

            $scope.showWorkForm = function() {
                vm.workaddflag = true;
            }

            $scope.hideWorkForm = function() {
                vm.workaddflag = false;
                vm.worksummary = '';
                vm.worktype = '';
                vm.worknotes = '';
                vm.attachment = '';
                vm.workerror = '';
            }

            vm.claimtypes = [];
            ClaimService.GetClaimTypes()
                .then(function(response) {
                    if (response.constructor === Array) {
                        vm.claimtypes = response;
                    }
                });

            vm.worktypes = [];
            WorklogService.GetWorkTypes()
                .then(function(response) {
                    if (response.constructor === Array) {
                        vm.worktypes = response;
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
                $scope.populateFields();
                $scope.addresslist=null;
            }

            $scope.populateFields=function() {
                AddressService.CompleteAddress(vm.property)
                    .then(function(response) {
                        var address = response;
                        vm.canonicalid = address.property_canonical_address;
                        vm.address1 = address.address1;
                        vm.address2 = address.address2;
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

            $scope.timelineType = function(index) {
                if(index%2 ==0) {
                    return null;
                } else {
                    return 'timeline-inverted';
                }
            }
        };

        function worklogHistory() {

            vm.workitems = [];
            WorklogService.GetWorkItems(vm.claimid)
                .then(function(response) {
                    vm.workitems = response;
                    console.log(response);
                });
        }
        function submit() {
            vm.loading = true;

            vm.error = undefined;
            vm.alertmessage = undefined;

            if (vm.claimid) {
                ClaimService.ClaimExists(vm.claimid)
                    .then(function(response) {
                        var claimid = response;

                        if (claimid) {
                            var ClaimDetails = {
                                claimid: claimid,
                                property_canonical_id: vm.canonicalid,
                                claimtypeid: vm.claimtype.claimtypeid,
                                summary: vm.summary,
                                description: vm.description,
                                submitteduser: vm.username
                            };
                            // Get Property details
                            if(vm.canonicalid) {
                                PropertyService.GetPropertyByCanonical(vm.canonicalid)
                                    .then(function(payload) {
                                        if (payload) {
                                            // yes we found it
                                            ClaimDetails.property_canonical_id = payload.property_canonical_id;
                                            callUpdateClaim(ClaimDetails);
                                        } else {
                                            // create new
                                            var PropertyDetails = {
                                                property_canonical_id: vm.canonicalid,
                                                address1: vm.address1,
                                                address2: vm.address2,
                                                suburb: vm.suburb,
                                                state: vm.state,
                                                postcode: vm.postcode,
                                                country: vm.country,
                                                latitude: vm.latitude,
                                                longitude: vm.longitude,
                                                unit_type: vm.unit_type,
                                                mesh_block: vm.mesh_block,
                                                propertytype: 5 // default to others to specify new
                                            };

                                            PropertyService.CreateProperty(PropertyDetails, function(results, response) {
                                                if (results == true) {
                                                    vm.canonicalid = response.property_canonical_id;
                                                    vm.propertyid = response.propertyid;

                                                    // inserted property - create the claim
                                                    ClaimDetails.property_canonical_id = response.property_canonical_id;
                                                    callUpdateClaim(ClaimDetails);
                                                } else {
                                                    // Return callback error
                                                    vm.error = 'Something went wrong!';
                                                    vm.loading = false;
                                                }
                                            });
                                        }
                                    });
                            } else {
                                vm.loading = false
                                vm.error = 'Property not found!';
                            }
                        } else {
                            vm.error = 'Something went wrong!';
                            vm.loading = false;
                        }
                    });
            } else {
                // Create new claim
                var ClaimDetails = {
                    property_canonical_id: vm.canonicalid,
                    claimtypeid: vm.claimtype.claimtypeid,
                    summary: vm.summary,
                    description: vm.description,
                    submitteduser: vm.username
                };
                // Get Property details
                if(vm.canonicalid) {
                    PropertyService.GetPropertyByCanonical(vm.canonicalid)
                        .then(function(payload) {
                            if (payload) {
                                // yes we found it
                                ClaimDetails.property_canonical_id = payload.property_canonical_id;
                                callCreateClaim(ClaimDetails);
                            }
                            else {
                                // create new
                                var PropertyDetails = {
                                    property_canonical_id: vm.canonicalid,
                                    address1: vm.address1,
                                    address2: vm.address2,
                                    suburb: vm.suburb,
                                    state: vm.state,
                                    postcode: vm.postcode,
                                    country: vm.country,
                                    latitude: vm.latitude,
                                    longitude: vm.longitude,
                                    unit_type: vm.unit_type,
                                    mesh_block: vm.mesh_block,
                                    propertytype: 5 // default to others to specify new
                                };

                                PropertyService.CreateProperty(PropertyDetails, function(results, response) {
                                    if (results == true) {
                                        vm.canonicalid = response.property_canonical_id;
                                        vm.propertyid = response.propertyid;

                                        // inserted property - create the claim
                                        ClaimDetails.property_canonical_id = response.property_canonical_id;
                                        callCreateClaim(ClaimDetails);
                                    } else {
                                        // Return callback error
                                        vm.error = 'Something went wrong!';
                                        vm.loading = false;
                                    }
                                });
                            }
                        });
                } else {
                    vm.loading = false
                    vm.error = 'Property not found!';
                }
            }

        };

        function callCreateClaim(ClaimDetails) {
            console.log(ClaimDetails);
            ClaimService.CreateClaim(ClaimDetails, function(results, response) {
                if (results == true) {
                    vm.alertmessage = "Claim successfully submitted!";
                    $timeout(function() {
                        vm.alertmessage = undefined;
                    }, 3000);
                    vm.loading = false;
                } else {
                    // Return callback error
                    if(response.data.code == 'ER_DUP_ENTRY') {
                        vm.error = 'Claim already exists';
                    } else {
                        vm.error = 'Something went wrong!';
                    }
                    vm.loading = false;
                }
            });
        };

        function callUpdateClaim(ClaimDetails){
            console.log(ClaimDetails);
            ClaimService.UpdateClaim(ClaimDetails, function(results, response) {
                if (results == true) {
                    vm.alertmessage = "Claim successfully updated!";
                    $timeout(function() {
                        vm.alertmessage = undefined;
                    }, 3000);
                    vm.loading = false;
                } else {
                    // Return callback error
                    if(response.data.code == 'ER_DUP_ENTRY') {
                        vm.error = 'Claim already exists';
                    } else {
                        vm.error = 'Something went wrong!';
                    }
                    vm.loading = false;
                }
            });
        }

        function submitwork() {

            var WorklogDetails = {
                worklogid: vm.claimid,
                description: vm.summary,
                worktype: vm.worktype.worktypetypeid,
                notes: vm.worknotes,
                username: vm.username
            };

            if(vm.workitemid) {
                // this is an update, check if it does exists
                WorklogService.WorklogExists(workitemid)
                    .then(function(response) {
                        var workitemid = response;

                        if(workitemid) {
                            //WorklogService.UpdateWorklog
                        }
                    })
            } else {
                WorklogService.CreateWorklog(WorklogDetails, vm.attachment, function(result, response) {
                    if(result) {

                        if (response) {
                            console.log(payload);
                            vm.loading = false;
                            vm.workmessage = 'Added worklog';
                        }
                    } else {
                        console.log(response);
                        vm.loading = false;
                        vm.workerror = 'Error adding worklog';
                    }
                });
            }
        }

    }
})();