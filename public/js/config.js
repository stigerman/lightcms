var app = angular.module('app', ['ui.router','ui.bootstrap','ngRoute', 'ngCookies', 'ngMaterial', 'ngMessages','ngTouch'])

app.config(function($stateProvider, $httpProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/home');   
        $stateProvider
            .state('adminlogin', {
                url: '/login',    
                templateUrl: 'templates/admin/login.html',
                controller: 'AdminLoginCtrl'
        })
        $stateProvider
            .state('adminreg', {
                url: '/register',    
                templateUrl: 'templates/admin/register.html',
                controller: 'AdminLoginCtrl'
        })
        $stateProvider
            .state('home', {
                url: '/home',    
                templateUrl: 'templates/home.html',
                controller: 'AdminLoginCtrl'
        })
        
        
        $stateProvider
            .state('adminpages', {
                url:'/adminpages',
                templateUrl: 'templates/admin/pages.html',
                controller: 'AdminPagesCtrl'
        });
        $stateProvider
            .state('adminedit', {
                url:'/admin/add-edit-page/:id', 
                templateUrl: 'templates/admin/add-edit-page.html',
                controller: 'AddEditPageCtrl'
        });
        
        $stateProvider
            .state('blog', {
                url: '/blog',
                templateUrl: 'templates/blog.html',
                controller: 'BlogCtrl'
            })    

        
        $stateProvider
            .state('blogread', {
                url:'/pages/details/:url', 
                templateUrl: 'templates/blogpage.html',
                controller: 'BlogPageCtrl'
        });
            
            $locationProvider.html5Mode({
              enabled: true,
              requireBase: false
            })
        })



.controller('AdminPagesCtrl', function($scope, $log, $http, $state) {
      
    $http.get('/pages').then(
        
          function(response) {
            $scope.allPages = response.data;
          },
          function(err) {
            $log.error(err);
          });
    
          $scope.deletePage = function(id) {
            $http.get('/pages/delete/' + id);
          };
          
          $scope.editPage = function(id) {
            $state.go('adminedit', {id: id});
          }

})

 .controller('AdminLoginCtrl', function($scope, $location, $cookies, $http, $log) {
        $scope.credentials = {
          username: '',
          password: ''
        };


        $scope.addUser = function(user) {
            $http.post('/addUser', user).then(function(res,err){
                if(err){
                    console.log(err);
                }
              $location.path('/adminpages');
            })
        }
        
        $scope.login = function(credentials) {
           $http.post('/adminlogin', credentials).then(
            function(res, err) {
              $cookies.loggedInUser = res.data;
              console.log($cookies);
              $location.path('/adminpages');
            },
            function(err) {
                console.log(err.data);
            });
    
          };
          
          $scope.logout = function(){
          $http.get('/adminlogout').then(function(res,err){
                console.log(res);
          });
          }
})

.controller('AddEditPageCtrl', ['$scope','$http', '$log', '$stateParams','$routeParams', '$location',  function($scope, $http, $log, $stateParams, $routeParams, $location) {
        $scope.pageContent = {};
        $scope.pageContent._id = $stateParams.id;
        $scope.heading = "Add a New Page";
        
        if ($scope.pageContent._id !== 0 && $scope.pageContent._id.length > 1 ) {
            console.log($scope.pageContent);        
          $scope.heading = "Update Page";
          $http.get('/pages/admin-details/' + $stateParams.id)
          .then(
              function(response) {
                $scope.pageContent = response.data;
                $log.info($scope.pageContent);
              },
              function(err) {
                $log.error(err);
              });
        }
       $scope.pageInfo = function($scope, $http, $stateParams){
         $http.get('/pages/admin-details/' + $stateParams.id)
                .then(function(res){ return res.data; });
        }
        

        
        $scope.updateURL=function(){

            var title = $scope.pageContent.title;
            $scope.pageContent.url= title;
            
        }       



        $scope.savePage = function(pageContent){
        console.log(pageContent);
        var id = pageContent._id;
        console.log("this was called by savePage function" + id);

        if (id === 0 || id.length < 1) {
          $http.post('/pages/add', pageContent).then(function() {
              $location.path('/adminpages');
          }, function(){
              console.log("Page Saved Successfully");
          });
        } else {
          $http.post('/pages/update', pageContent).then(function() {
              $location.path('/adminpages');
            },
            function(err) {
                console.log(err)
            });
        }
     
     
    }

    }
])

.controller('BlogCtrl', function($scope, $http, $state){

        $http.get('/pages').then(function(response){
            console.log(response);
            $scope.pages = response.data;
             $scope.letterLimit = 150;

        });

          $scope.readmore = function(url) {
            console.log(url);
            $state.go('blogread', {url: url});
          }
    
})



.controller('BlogPageCtrl', function($scope, $http, $stateParams){

        $http.get('/pages/details/' + $stateParams.url).then(function(response){
            console.log(response);
            $scope.page = response.data;
        });
    
})

