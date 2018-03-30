(function (){
    'use strict';

    angular
        .module('app')
        .controller('Claim.IndexController', ['ClaimService', '$scope', 'NgTableParams', function(ClaimService, $scope, NgTableParams){

            $scope.adminuser = true;

            var self = this;

            ClaimService.GetClaim(function(data) {
                if (data) {
                    console.log(data);
                    self.tableParams = new NgTableParams({
                        page: 1,
                        count: 25
                    }, {
                        dataset: data
                    });
                } else {
                    self.tableParams = new NgTableParams({
                        page: 1,
                        count: 25
                    }, {
                        dataset: {}
                    });
                }
            });


            self.getStatus = getStatus;
            self.getClaimType = getClaimType;

            function getClaimType() {
                var types = [
                    {claimtype: "Inquiry"},
                    {claimtype: "Complaint"},
                    {claimtype: "Request"},
                    {claimtype: "Maintenance"}
                ];

                return types;
            }

            function getStatus() {
                var statuses = [
                    {status: "Open"},
                    {status: "Assigned"},
                    {status: 'In Review'},
                    {status: 'Closed'}
                ];

                return statuses;
            }


        }]);
})();
