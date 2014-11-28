var namespace = angular.module('accShare', ['ngCookies', 'ngSanitize']);

var getUnifiedUrl = function(url) {
  var temp = url.replace("http://", '').replace("https://", '').replace("www.", '');
    return temp.split('?')[0].split('/')[0];
}

namespace.controller('MainCtrl', ['$scope', '$http', '$cookies', function($scope, $http, $cookies) {
  $scope.getAccounts = function(site) {
    var searchString = getUnifiedUrl(site);
    $http.get('/api/accounts/' + searchString).success(function(data) {
      if (data.length == 0)
        $scope.alert = {
          msg: "No results found.",
          type: "warning"
        };

      for (var i in data) {
        data[i].added = new Date(data[i].added).toDateString();
      }

      $scope.accounts = data;
      document.querySelector('.searchbox').blur();
    });
  };

  $scope.downvote = function(id) {
    $http.post('/api/accounts/downvote', {
      id: id
    }).success(function(data) {
      $scope.alert = {
        msg: data.message,
        type: data.status
      };
    });
  };

  $scope.addAccount = function(site, username, password) {
    $scope.showLoader = true;
    var msg = "Required fields are missing: ";
    var missing = false;
    if (!site) {
      document.querySelector('.siteinput').style.borderBottomColor = "#FF5722";
      missing = true;
    }
    if (!username) {
      document.querySelector('.userinput').style.borderBottomColor = "#FF5722";
      missing = true;

    }
    if (!password) {
      document.querySelector('.passwordinput').style.borderBottomColor = "#FF5722";
      missing = true;

    }

    if(missing){
        $scope.showLoader = false;
        return;
    }


    $http.post('/api/accounts/add', {
      site: site,
      user: username,
      password: password
    }).success(function(data) {
      $scope.getAccounts(data.site);
      $scope.alert = {
        msg: data.message,
        type: data.status
      };
      $scope.hideForm();
      $scope.showLoader = false;
    });


  };

  $scope.getCount = function() {
    $http.get('/api/accounts/getCount').success(function(data) {
      $scope.count = data.count;
    });
  }

  $scope.showForm = function() {
    $scope.darkenScreen = true;
    $scope.showAddForm = true;
  }

  $scope.hideForm = function() {
    if ($scope.showAddForm) {
      $scope.darkenScreen = false;
      $scope.showAddForm = false;
    }
  }

  $scope.clearAlert = function() {
    $scope.alert = {};
  }

  $scope.agreeTOU = function() {
   $scope.showTermsOfUse = false;
    $cookies.agreedToTermsOfUse = 1;
  }

  $scope.encodeStr = function(rawStr) {
    rawStr.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
      return '&#' + i.charCodeAt(0) + ';';
    });
  }

  $scope.currentDate = new Date().toDateString();
  $scope.getCount();

  if ($cookies.agreedToTermsOfUse != 1) {
    $scope.showTermsOfUse = true;
  }


}]);
