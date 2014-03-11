'use strict';

angular.module('sitesApp').controller('MainCtrl', function($scope, $http, $filter) {

  // we will store our form data in this object
  $scope.submitted = false;
  $scope.formData = {};

  // Test values.
  // $scope.formData.name = 'Adam Campbell';
  // $scope.formData.board = 459747;

  // Table sorting.
  $scope.predicate = 'place';
  $scope.reverse = false;


  function requestSuccess(data) {
    $scope.submitted = false;
    $scope.loading = false;

    $scope.scores = data;
    $scope.averages = $filter('averageScore')(data);
  }

  function requestError(data) {
    $scope.message = data;
    $scope.loading = false;
  }

  // Set ID from quick pick
  $scope.setId = function(id) {
    $scope.formData.board = id;
  };

  // Submit form
  $scope.submit = function(isValid) {

    $scope.submitted = true;

    if (isValid) {

      $scope.loading = true;

      $http({
        url: '/api/leaderboard',
        method: 'POST',
        cache: true,
        timeout: 20000,
        data: {
          id: $scope.formData.board,
          name: $scope.formData.name
        }
      }).success(requestSuccess).error(requestError);

    }

  };

});