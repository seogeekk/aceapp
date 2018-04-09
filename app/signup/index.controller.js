(function (){
    'use strict';

    angular
        .module('app')
        .controller('Signup.IndexController', Controller);

    function Controller($location, AuthenticationService, SignupService) {
        var vm = this;

        vm.create = create;
        initController();

        function initController() {
            // reset login status
            AuthenticationService.Logout();
        };

        function create() {
            vm.loading = true;

            var UserDetails = {
                username: vm.username,
                firstname: vm.firstname,
                lastname: vm.lastname,
                emailaddress: vm.email,
                password: vm.password
            }

            SignupService.CreateUser(UserDetails, function (result, response) {
                if (result == true) {
                    $location.path('/');
                } else {
                    var code = null;
                    if (response) {
                        code = response.code
                    }
                    // Return callback error
                    if(code == 'ER_DUP_ENTRY') {
                        vm.error = 'Username already taken';
                    } else {
                        vm.error = 'Something went wrong';
                    }
                    vm.loading = false;
                }
            });
        };
    }
})();