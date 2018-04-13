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
  .module('app', ['ui.router', 'ngMessages', 'ngStorage', 'ngTable', 'ui.bootstrap', 'ui.select', 'ngSanitize', 'ngFileUpload', 'moment-picker'])
  .config(config)
  .run(run);

function config($stateProvider, $urlRouterProvider) {
  // default route
   $urlRouterProvider.otherwise("/");

   $stateProvider
       .state('home', {
           url: '/',
           views: {
               '@': {
                   templateUrl: 'home/index.view.html',
                   controller: 'Home.IndexController',
                   controllerAs: 'vm'
               },
               'body@home': {
                   controller: function($state) {
                       $state.go('request');
                   }
               }
           }
       })
       .state('request', {
           url: 'request',
           parent: 'home',
           views: {
               'body@home': {
                   templateUrl: 'claim/index.view.html',
                   controller: 'Claim.IndexController',
                   controllerAs: 'vm'
               }
           }
       })
       .state('managerequest', {
           url: 'request/manage/:claimid',
           parent: 'home',
           //params: { claimid: null },
           views: {
               'body@home': {
                   templateUrl: 'claim/manage.view.html',
                   controller: 'ManageClaim.IndexController',
                   controllerAs: 'vm'
               }
           }
       })
       .state('profile', {
           url: 'profile',
           parent: 'home',
           views: {
               'body@home': {
                   templateUrl: 'profile/index.view.html',
                   controller: 'UserProfile.IndexController',
                   controllerAs: 'vm'
               }
           }
       })
       .state('property', {
           url: 'property',
           parent: 'home',
           views: {
               'body@home': {
                   templateUrl: 'property/index.view.html',
                   controller: 'Property.IndexController',
                   controllerAs: 'vm'
               }
           }
       })
       .state('manageproperty', {
           url: 'property/manage/:propertyid',
           parent: 'home',
           views: {
               'body@home': {
                   templateUrl: 'property/manage.view.html',
                   controller: 'ManageProperty.IndexController',
                   controllerAs: 'vm'
               }
           }
       })
       .state('staff', {
           url: 'staff',
           parent: 'home',
           views: {
               'body@home': {
                   templateUrl: 'staff/index.view.html',
                   controller: 'Staff.IndexController',
                   controllerAs: 'vm'
               }
           }
       })
       .state('managestaff', {
           url: 'staff/manage/:staffusername',
           parent: 'home',
           views: {
               'body@home': {
                   templateUrl: 'staff/manage.view.html',
                   controller: 'ManageStaff.IndexController',
                   controllerAs: 'vm'
               }
           }
       })
       .state('login', {
           url: '/login',
           templateUrl: 'login/index.view.html',
           controller: 'Login.IndexController',
           controllerAs: 'vm'
       })
       .state('signup', {
           url: '/signup',
           templateUrl: 'signup/index.view.html',
           controller: 'Signup.IndexController',
           controllerAs: 'vm'

       })
}

function run($rootScope, $http, $location, $localStorage) {
   // keep user logged in after page refresh
   if ($localStorage.currentUser) {
       $http.defaults.headers.post['x-access-token'] = $localStorage.currentUser.token;
       $http.defaults.headers.post['x-key'] = $localStorage.currentUser.username;
   }

   $rootScope.$on('$locationChangeStart', function(event, next, current) {
       var publicPages = ['/login', '/signup'];
       var restrictedPage = publicPages.indexOf($location.path()) === -1;
       if (restrictedPage && !$localStorage.currentUser) {
          $location.path('/login');
       }
   });
}