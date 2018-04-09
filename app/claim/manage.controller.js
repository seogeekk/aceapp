(function (){
    'use strict';

    angular
        .module('app')
        .controller('ManageClaim.IndexController', Controller);

    function Controller($scope, $state, $location, $stateParams, $localStorage, ClaimService, AddressService, PropertyService, WorklogService, StaffService, $timeout) {
        var vm = this;

        // functions
        vm.submit = submit;
        vm.submitwork = submitwork;
        vm.assign = assign;
        vm.deleteAttachment = deleteAttachment;

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
                            refreshStatusBar();
                        } else {
                            alert("Claim not found!");
                            $state.go("request");
                        }
                    });

                worklogHistory();
                populateAssignee();
            } else {
                // This assumes it is a new claim
                vm.editflag = true;
            }

            $scope.isStaff = function() {
                if (vm.roleid != 4) {
                    return true;
                }

                return false;
            }

            $scope.changeAssign=function() {
                $scope.assignedit = true;
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
                vm.workitemid = '';
                $scope.uploadflag = true;
                vm.attachid = '';
                vm.attachmentfile = '';
            }

            $scope.editWorkForm = function(workitem) {
                vm.workaddflag = true;
                vm.workitemid = workitem.workitemid;
                vm.inspectiondate = '';
                vm.worklogdesc = workitem.description;
                vm.worktype = {worktypename: workitem.worktype.name, worktypetypeid: workitem.worktype.typeid };
                vm.worknotes = workitem.notes;
                if (workitem.attachment.itemid) {
                    vm.attachid = workitem.attachment.itemid;
                    vm.attachmentfile = workitem.attachment.attachment;
                    // do not show upload
                    $scope.uploadflag = false;
                } else {
                    $scope.uploadflag = true;
                }
                vm.workerror = '';
                $scope.onWorkType();
            }

            $scope.hideWorkForm = function() {
                vm.workaddflag = false;
                vm.worklogdesc = '';
                vm.inspectiondate = '';
                vm.worktype = '';
                vm.worknotes = '';
                vm.attachment = '';
                vm.workerror = '';
            }

            ClaimService.GetClaimTypes()
                .then(function(response) {
                    if (response.constructor === Array) {
                        vm.claimtypes = response;
                    }
                });

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

        $scope.getStaff=function(string){
            StaffService.SearchStaff(string)
                .then(function(response) {
                    $scope.stafflist=response;
                });
        }
        $scope.fillStaff=function(string){
            vm.staffassign=string;
            $scope.stafflist=null;
        }

        function refreshStatusBar() {
            $scope.getStatusColor = function() {
                // set bg-status
                if (vm.status.statusid == 8 || vm.status.statusid == 9) {
                    return 'progress-bar-danger';
                } else if (vm.status.statusid == 1) {
                    return 'progress-bar-info';
                } else if (vm.status.statusid == 7) {
                    return 'progress-bar-success';
                } else {
                    return 'progress-bar-warning';
                }
            }

            $scope.getPercentage=function() {
                if (vm.status.statusid == 8 || vm.status.statusid == 9) {
                    return 100;
                } else if (vm.status.statusid == 1) {
                    return 10;
                } else if (vm.status.statusid == 7) {
                    return 100;
                } else {
                    return vm.status.statusid*10;
                }
            }
        };

        function deleteAttachment() {

            WorklogService.DeleteAttachment(vm.workitemid, vm.attachid)
                .then(function(response) {
                    if (response) {
                        // delete
                        vm.attachid = '';
                        vm.attachmentfile = '';
                        worklogHistory();
                        $scope.uploadflag = true;
                    } else {
                        vm.workerror = 'Something went wrong!';
                    }
                });

        };

        /*
            This is for the assignment of ticket
         */
        function assign() {
            $scope.stafflist = '';
            if (! vm.staffassign.username) {
                vm.staffassign = {username: undefined, staffname: 'Unassigned'};
            } else {
                var ClaimDetails = {
                    claimid: vm.claimid,
                    username: vm.staffassign.username,
                    auditwho: vm.username
                }

                ClaimService.AssignClaim(ClaimDetails, function(results, response){
                    if (results == false) {
                        vm.staffassign = {username: undefined, staffname: 'Unassigned'};
                        return;
                    } else {
                        $scope.assignedit = false;
                    }
                });
            }
        }

        function populateAssignee() {
            // get from backend
            vm.staffassign = {username: undefined, staffname: 'Unassigned'};
            ClaimService.GetAssignment(vm.claimid, function(error, response){
                if (response) {
                    vm.staffassign = {username: response.username, staffname: response.staffname};
                }
            })
        }

        function worklogHistory() {

            WorklogService.GetWorkItems(vm.claimid)
                .then(function(response) {
                    vm.workitems = response;
                    console.log(response);
                });
        }

        $scope.checkWorkList=function (worktypeid) {
            if (worktypeid == 3) {
                if (!$scope.isStaff()) {
                    return true;
                }
            } else {
                return false;
            }
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

        // WorkType
        $scope.onWorkType=function(){
            if (vm.worktype.worktypetypeid == 3) {
                //
                $scope.isServiceLog = true;
            } else {
                $scope.isServiceLog = false;
            }
        }

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

            vm.loading=true;
            vm.workerror = '';

            var WorklogDetails = {
                worklogid: vm.claimid,
                description: vm.summary,
                worktype: vm.worktype.worktypetypeid,
                notes: vm.worknotes,
                username: vm.username
            };

            if(vm.workitemid) {
                // this is an update, check if it does exists
                WorklogDetails.workitemid = vm.workitemid;
                WorklogService.UpdateWorklog(WorklogDetails, vm.attachment, function(result, response) {

                    if(result) {
                        if (response) {
                            vm.loading = false;
                            vm.workmessage = 'Worklog updated';
                            $timeout(function() {
                                vm.workmessage = undefined;
                            }, 3000);
                            worklogHistory();
                            $scope.hideWorkForm();
                        } else {
                            vm.loading = false;
                            vm.workerror = 'Error updating worklog';
                        }
                    } else {
                        console.log(response);
                        vm.loading = false;
                        vm.workerror = 'Error updating worklog';
                    }
                });

            } else {
                WorklogService.CreateWorklog(WorklogDetails, vm.attachment, function(result, response) {

                    if(result) {
                        if (response) {
                            vm.workitemid = response;
                            vm.loading = false;
                            vm.workmessage = 'Added worklog';
                            $timeout(function() {
                                vm.workmessage = undefined;
                            }, 3000);
                            worklogHistory();
                            $scope.hideWorkForm();
                        } else {
                            vm.loading = false;
                            vm.workerror = 'Error adding worklog';
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