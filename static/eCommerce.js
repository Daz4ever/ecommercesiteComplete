var app = angular.module('eCommerce', ['ui.router', 'ngCookies', 'ngAnimate']);

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state({
    name: 'mainpicpage',
    url: '/',
    templateUrl: 'templates/mainPicPage.html',
  })

  .state({
    name: 'frontpage',
    url: '/frontpage',
    templateUrl: 'templates/frontpage.html',
    controller: 'frontpageController'
  })
  .state({
    name: 'productDetails',
    url: '/product/{productId}',
    templateUrl: 'templates/productDetails.html',
    controller: 'productDetailsController'
  })
  .state({
    name: 'signup',
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'signupController'
  })
  .state({
    name: 'login',
    url: '/user/login',
    templateUrl: 'templates/login.html',
    controller: 'loginController'
  })
  .state({
    name: 'shoppingCart',
    url: '/user/shoppingcart',
    templateUrl: 'templates/shoppingcart.html',
    controller: 'shoppingCartController'
  })
  .state({
    name: 'checkout',
    url: '/user/shoppingcart/checkout',
    templateUrl: 'templates/checkoutpage.html',
    controller: 'checkOutController'
  })
  .state({
    name: 'thankYou',
    url: '/user/shoppingcart/checkout/complete',
    templateUrl: 'templates/thankYou.html',
    controller: 'thankYouController'
  })
  $urlRouterProvider.otherwise('/');
})
//

//
app.factory('yachtFactory', function factoryFunction($http, $rootScope, $cookies) {
  var service = {};
  var userInfo = {};
  $rootScope.factoryCookieData = null;
  $rootScope.factoryCookieData = $cookies.getObject('cookieData');
  console.log("Printing initial cookie", $rootScope.factoryCookieData);

  console.log("I am inside the factory!");
  if ($rootScope.factoryCookieData) {
    console.log("I am a cookie data in the factory!");
    // grab auth_token from the cookieData
    $rootScope.authToken = $rootScope.factoryCookieData.auth_token;
    // grab user information from cookieData
    $rootScope.user_info = $rootScope.factoryCookieData.user;
  }

  $rootScope.logout = function(){
    $cookies.remove('cookieData');
    $rootScope.factoryCookieData = null;
    $rootScope.user_info = null;
    $rootScope.authToken = null;

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
  service.deleteFromCart = function(auth_token, product) {
    return $http({
      method: 'POST',
      url: 'api/shopping_cart/delete',
      data: {
      auth_token: auth_token,
      shopping_cart_id: product
    }
  });


    }
  service.Cart = function(){
    return $http ({
      method: 'GET',
      url: '/api/shopping_cart',
      params: {
        auth_token: $rootScope.authToken
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
    if($scope.authToken) {
    $scope.added = true;
    yachtFactory.addToCart($rootScope.authToken, $scope.productId)
    console.log($rootScope.authToken)
    console.log($scope.productId)
    $state.go('productDetails')
  }
  else{
    $scope.notAdded = true;
  }
}
});
app.controller('shoppingCartController', function($scope, $stateParams, yachtFactory, $rootScope, $state) {
  $scope.delete = function(product){
    console.log(product);
    yachtFactory.deleteFromCart($rootScope.authToken, product)
    .success(function(data) {
      $state.reload();
    })
  }
  yachtFactory.Cart()
  .success(function(data) {
    $scope.shoppingCartData = data;
    console.log("hello there guy")
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
      console.log("something here was undefined");
    } else {
      console.log("we entered the else clause");
      var handler = StripeCheckout.configure({
      // publishable key
      key: 'pk_test_nFAPJ3VBn1iEmQQNMSNuS1bX',
      locale: 'auto',
      token: function callback(token) {
        var stripeToken = token.id;
        console.log("Token", token);
        // Make checkout API call here and send the stripe token
        // to the back end
        yachtFactory.Checkout($rootScope.myToken, Address, token)
          .success(function() {
            console.log("address info entered");

          }).error(function(data) {
            console.log("none")
          });
          $state.go('thankYou')
        }
      })
      handler.open({
       name: 'FOURTHDIMENSION',
       description: 'Watches',
       amount: $scope.sum * 100
      });
    };
    // $scope.stripeHandler.open({
    //  name: 'FOURTHDIMENSION',
    //  description: 'Watches',
    //  amount: $scope.sum
    // });
 }
  yachtFactory.Cart()
    .success(function(data) {
      console.log("DATA being returned", data);
      $scope.shoppingCartData = data;

       var sum = 0;
       for(var i=0; i<data.length; i++) {
         sum += $scope.shoppingCartData[i].prodprice;
       }
        $scope.sum = sum;
        console.log("Sum", $scope.sum);
    });

});

//     yachtFactory.Checkout($rootScope.myToken, Address)
//     .success(function() {
//       console.log("address info entered");
//
//     }).error(function(data) {
//       console.log("none")
//     });
//     $state.go('thankYou')
// }
// }
// yachtFactory.Cart()
// .success(function(data) {
//   $scope.shoppingCartData = data;
//
//
//   var sum = 0;
//   for(var i=0; i<data.length; i++) {
//     sum += $scope.shoppingCartData[i].prodprice
//   }
//   $scope.sum = sum;
// });
//   });
app.controller('thankYouController', function($scope){

})

  app.controller('signupController', function($scope, $state, yachtFactory) {
    $scope.submit = function(token) {

      console.log("correct!");
      var userInfo = {
        'username': $scope.username,
        'email': $scope.email,
        'first_name': $scope.firstname,
        'last_name': $scope.lastname,
        'password': $scope.pass1,
        'password2': $scope.pass2
        // 'stripe_token': token

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
        $cookies.putObject('cookieData', data)
        console.log("wass up")
        $rootScope.user_info = data.user
        console.log(data.user);
        $rootScope.authToken = data.auth_token;
        $state.go('frontpage');
      });
    }
  });
