var namespace = angular.module('accShare', ['ngCookies', 'ngSanitize', 'ui.bootstrap']);

String.prototype.replaceArr = function(findArr, replaceArr) {
    var inStr = this;
    var oneReplace = false;
    if(replaceArr.length == 1) {
        oneReplace = true;
    }
    for(var i in findArr) {
        if(oneReplace){
            inStr = inStr.replace(findArr[i], replaceArr[0]);
        }else{
            inStr = inStr.replace(findArr[i], replaceArr[i]);
        }
    }
    return inStr;
}

namespace.controller('MainCtrl', ['$scope', '$http', '$cookies', function($scope, $http, $cookies){
    $scope.getAccounts = function(site) {
        var searchString = site.replaceArr(['http://', 'https://', 'www.'], ['']);
        $http.get('/api/accounts/' + searchString).success(function(data) {
            if(data.length == 0)
                $scope.alert = { msg: "No results found.", type: "warning" };

            for(var i in data){
                data[i].added = new Date(data[i].added).toDateString();
            }

            $scope.accounts = data;
        });
    };

    $scope.downvote = function(id) {
        $http.post('/api/accounts/downvote', { id: id }).success(function(data) {
            $scope.alert = { msg: data.message, type: data.status };
        });
    };

    $scope.addAccount = function(site, username, password) {
        $scope.showLoader = true;
        var msg = "Required fields are missing: ";
        var missing = [];
        if(!site)
            missing.push("URL");
        if(!username)
            missing.push("Username");
        if(!password)
            missing.push("Password");

        msg += missing.join(', ');

        if(missing.length != 0) {
            $scope.addAlert = { msg: msg, type: "warning" };
            $scope.showLoader = false;
            return;
        }

        $http.post('/api/accounts/add', { site: site, user: username, password: password }).success(function(data) {
            $scope.getAccounts(data.site);
            $scope.alert = { msg: data.message, type: data.status };
            $scope.hideForm();
            $scope.showLoader = false;
        });


    };

    $scope.getCount = function() {
        $http.get('/api/accounts/getCount').success(function (data) {
            $scope.count = data.count;
        });
    }

    $scope.showForm = function() {
        $scope.darkenScreen = true;
        $scope.showAddForm = true;
    }

    $scope.hideForm = function() {
        if($scope.showAddForm){
            $scope.darkenScreen = false;
            $scope.showAddForm = false;
        }
    }

    $scope.clearAlert = function() {
        $scope.alert = {};
    }

    $scope.agreeTOU = function() {
        $scope.darkenScreen = false;
        $scope.showTermsOfUse = false;
        $cookies.agreedToTermsOfUse = 1;
    }

    $scope.encodeStr = function(rawStr) {
        rawStr.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
            return '&#'+i.charCodeAt(0)+';';
        });
    }

    $scope.currentDate = new Date().toDateString();
    $scope.getCount();

    if($cookies.agreedToTermsOfUse != 1){
        $scope.darkenScreen = true;
        $scope.showTermsOfUse = true;
    }


}]);
