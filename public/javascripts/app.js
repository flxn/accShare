var namespace = angular.module('accShare', ['ngCookies', 'ngSanitize']);

var getUnifiedUrl = function(url) {
  if(url) {
    var temp = url.replace("http://", '').replace("https://", '').replace("www.", '');
    return temp.split('?')[0].split('/')[0];

  }else{
    return false;
  }
}

var close_modal = function(modal_id){
      $(".lean_overlay").velocity( { opacity: 0}, {duration: 200, queue: false, ease: 'easeOutQuart'});
      $(modal_id).fadeOut(200, function() {
          $(this).css({ "top": 0 });
          $(".lean_overlay").css({"display":'none'});
      });

}

var resetModalInputs = function() {
  document.querySelector('#newurl').style.borderBottomColor = "";
  document.querySelector('#newuser').style.borderBottomColor = "";
  document.querySelector('#newpassword').style.borderBottomColor = "";
  document.querySelector('#newurl').value = "";
  document.querySelector('#newuser').value = "";
  document.querySelector('#newpassword').value = "";
}

namespace.controller('MainCtrl', ['$scope', '$http', '$cookies', function($scope, $http, $cookies) {
  $scope.getAccounts = function(site) {
    resetModalInputs();
    var searchString = getUnifiedUrl(site);
    $scope.currentSite = searchString;
    $http.get('/api/accounts/' + searchString).success(function(data) {
      if (data.length == 0)
        toast('No results found.', 3000);
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
      toast(data.message, 3000);
    });
  };

  $scope.addAccount = function(site, username, password) {
    $scope.showLoader = true;
    var missing = false;
    if (!site) {
      document.querySelector('#newurl').style.borderBottomColor = "#FF5722";
      missing = true;
    }
    if (!username) {
      document.querySelector('#newuser').style.borderBottomColor = "#FF5722";
      missing = true;

    }
    if (!password) {
      document.querySelector('#newpassword').style.borderBottomColor = "#FF5722";
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
      close_modal("#addnew");
      toast('Account added', 3000);
      resetModalInputs();
      
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

  if ($cookies.agreedToTermsOfUse != 1) {
    $scope.showTermsOfUse = true;
  }

  var url = document.URL;
  if(url){
    var parts = url.split('accshare.net/')
    if(parts[1] != ""){
      $scope.getAccounts(parts[1]);
    }
  }
  
}]);
