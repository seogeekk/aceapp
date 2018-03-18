/*


'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'myApp.view2',
  'myApp.version'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
*/

'use strict';

angular
  .module('app', ['ui.router', 'ngMessages', 'ngStorage', 'ngTable'])
  .config(config)
  .run(run);

function config($stateProvider, $urlRouterProvider) {
  // default route
   $urlRouterProvider.otherwise("/");

   $stateProvider
       .state('home', {
           url: '/',
           templateUrl: 'claim/index.view.html',
           controller: 'Claim.IndexController',
           controllerAs: 'vm'
       })
       .state('login', {
           url: '/login',
           templateUrl: 'login/index.view.html',
           controller: 'Login.IndexController',
           controllerAs: 'vm'
       });
}

function run($rootScope, $http, $location, $localStorage) {
   // keep user logged in after page refresh
   if ($localStorage.currentUser) {
       $http.defaults.headers.post['x-access-token'] = $localStorage.currentUser.token;
       $http.defaults.headers.post['x-key'] = $localStorage.currentUser.username;
   }

   $rootScope.$on('$locationChangeStart', function(event, next, current) {
       var publicPages = ['/login'];
       var restrictedPage = publicPages.indexOf($location.path()) === -1;
       if (restrictedPage && !$localStorage.currentUser) {
          $location.path('/login');
       }
   });
}