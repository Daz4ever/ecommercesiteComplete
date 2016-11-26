var app = angular.module('eCommerce', ['ui.router', 'ngCookies']);

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state({
    name: 'mainpicpage',
    url: '/',
    templateUrl: 'mainPicPage.html',
  })

  .state({
    name: 'frontpage',
    url: '/frontpage',
    templateUrl: 'frontpage.html',
    controller: 'frontpageController'
  })
  .state({
    name: 'productDetails',
    url: '/product/{productId}',
    templateUrl: 'productDetails.html',
    controller: 'productDetailsController'
  })
  .state({
    name: 'signup',
    url: '/signup',
    templateUrl: 'signup.html',
    controller: 'signupController'
  })
  .state({
    name: 'login',
    url: '/user/login',
    templateUrl: 'login.html',
    controller: 'loginController'
  })
  .state({
    name: 'shoppingCart',
    url: '/user/shoppingcart',
    templateUrl: 'shoppingcart.html',
    controller: 'shoppingCartController'
  })
  .state({
    name: 'checkout',
    url: '/user/shoppingcart/checkout',
    templateUrl: 'checkoutpage.html',
    controller: 'checkOutController'
  })
  .state({
    name: 'thankYou',
    url: '/user/shoppingcart/checkout/complete',
    templateUrl: 'thankYou.html',
    controller: 'thankYouController'
  })
  $urlRouterProvider.otherwise('/');
})
//

//
app.factory('yachtFactory', function factoryFunction($http, $rootScope, $cookies) {
  var service = {};
  var userInfo = {};

  $rootScope.logout = function(){
    $cookies.remove('userData');
    $rootScope.userName = '';
    $rootScope.userToken = null;
  };

  service.prods = function() {
    return $http ({
      method: 'GET',
      url: '/api/products'
    });
  };
  service.prodId = function(id) {
    return $http ({
      method: 'GET',
      url: '/api/product/' + id
    });
  };
  service.signUp = function(userdata) {
    return $http ({
      method: 'POST',
      url: '/api/customer/signup',
      data: userdata
    });
  }
  service.login = function(userdata) {
    return $http ({
      method: 'POST',
      url: '/api/user/login',
      data: userdata
    })
  }
  service.addToCart = function(auth_token, product_id) {
    return $http ({
      method: 'POST',
      url: '/api/shopping_cart',
      data: {
        auth_token: auth_token,
        product_id: product_id
      }
    });

  }
  service.deleteFromCart = function(auth_token, product_id) {
    return $http({
      method: 'POST',
      url: 'api/shopping_cart/delete',
      data: {
      auth_token: auth_token,
      product_id: product_id
    }
  });


    }
  service.Cart = function(){
    return $http ({
      method: 'GET',
      url: '/api/shopping_cart',
      params: {
        auth_token: $rootScope.myToken
      }
    })
  }
  service.Checkout = function(auth_token, address, stripeToken) {
    return $http ({
      method: 'POST',
      url: '/api/shopping_cart/checkout',
      data: {
        auth_token: auth_token,
        address: address,
        stripe_token: stripeToken
      }
    });
  };
  return service;
});

app.controller('frontpageController', function($scope, yachtFactory) {
  console.log('in front');
  yachtFactory.prods()
  .success(function(data) {
    console.log(data);
    $scope.searchresults = data
    console.log($scope.searchresults);
  })
})
app.controller('productDetailsController', function($scope, $stateParams, yachtFactory, $rootScope, $state) {
  $scope.productId = $stateParams.productId;
  console.log($scope.productId);
  yachtFactory.prodId($scope.productId)
  .success(function(data) {
    $scope.prodInfo = data[0]
    console.log($scope.prodInfo)
  })
  $scope.detailAddCart = function() {
    yachtFactory.addToCart($rootScope.myToken, $scope.productId)
    console.log($rootScope.myToken)
    console.log($scope.productId)
    $state.go('productDetails')
  }
});
app.controller('shoppingCartController', function($scope, $stateParams, yachtFactory, $rootScope, $state) {
  $scope.delete = function(product_id){
    console.log(product_id);
    yachtFactory.deleteFromCart($rootScope.myToken, product_id)
    .success(function(data) {
      $state.reload();
    })
  }
  yachtFactory.Cart()
  .success(function(data) {
    $scope.shoppingCartData = data;
    console.log($scope.shoppingCartData)


    var sum = 0;
    for(var i=0; i<data.length; i++) {
      sum += $scope.shoppingCartData[i].prodprice
    }
    $scope.sum = sum;
    $scope.checkout = function() {
      if(sum<= 0) {
        $scope.emptyCart = true;
      }
      else{
      $state.go('checkout')
     }
    }
  });
});
app.controller('checkOutController', function($scope, $stateParams, yachtFactory, $rootScope, $state) {
var Address = null;

  $scope.checkedOut = function(){

    Address = {
     'street_address': $scope.street_address,
     'city': $scope.city,
     'state': $scope.state,
     'zipcode': $scope.zipcode
   }

    if(Address['street_address'] === undefined || Address['city']===undefined || Address['state']===undefined || Address['zipcode'] === undefined)  {
      $scope.fillIn = true;
    }

    else{


    yachtFactory.Checkout($rootScope.myToken, Address)
    .success(function() {
      console.log("address info entered");

    }).error(function(data) {
      console.log("none")
    });
    $state.go('thankYou')
}
}
yachtFactory.Cart()
.success(function(data) {
  $scope.shoppingCartData = data;


  var sum = 0;
  for(var i=0; i<data.length; i++) {
    sum += $scope.shoppingCartData[i].prodprice
  }
  $scope.sum = sum;
});
  });
app.controller('thankYouController', function($scope){

})

  app.controller('signupController', function($scope, $state, yachtFactory) {
    $scope.submit = function() {

      console.log("correct!");
      var userInfo = {
        'username': $scope.username,
        'email': $scope.email,
        'first_name': $scope.firstname,
        'last_name': $scope.lastname,
        'password': $scope.pass1,
        'password2': $scope.pass2

      }
      yachtFactory.signUp(userInfo)
      .success(function() {
        $state.go('login')
      }).error(function(data) {
        console.log("failed")
        $scope.doesntMatch = true;
      });


      // .error() {
      //
      // }
      // $scope.doesntMatch = true;

    }
  });

  app.controller('loginController', function($scope, $state, yachtFactory, $cookies, $rootScope) {
    $scope.submitEnterSite = function(){
      var loginInfo = {
        'username': $scope.username,
        'password': $scope.pass1

      }
      // $rootScope.userName = $cookies.get('username');


      console.log($scope.username)
      yachtFactory.login(loginInfo)
      .error(function(data) {
        $scope.failed = true;
      })
      .success(function(data) {
        console.log(data);
        $cookies.putObject('userData', data.user)
        $cookies.put('token', data.authtoken)
        $cookies.put('username', data.user.username)
        $rootScope.userName = $cookies.get('username');
        console.log(loginInfo.password);
        $rootScope.myToken = $cookies.get('token');
        console.log($rootScope.myToken)
        $state.go('frontpage');
      });
    }
  });
