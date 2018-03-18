(function (){
    'use strict';

    angular
        .module('app')
        .controller('Claim.IndexController', ['ClaimService', '$scope', 'NgTableParams', function(ClaimService, $scope, NgTableParams){

            console.log("Initialise");
            $scope.adminuser = true;

            var self = this;
            ClaimService.GetClaim(function(data) {
               if (data) {
                   console.log(data);
                   self.tableParams = new NgTableParams({}, { dataset: data});
               } else {
                   console.log("No Results");
               }
            });
                // .then(function(data){
                //     console.log ("CLAIMS: " + data);
                //     $scope.c = data;
                // });

        }]);
})();
