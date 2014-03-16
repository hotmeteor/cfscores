'use strict';

angular.module('sitesApp').controller('MainCtrl', function($scope, $http, $filter) {

  // we will store our form data in this object
  $scope.submitted = false;
  $scope.formData = {};

  $scope.averages = [];
  $scope.scores = [];

  $scope.$watch('averages', function(){
    $scope.processedScores = _.map($scope.scores,function(athData){
      
      var rounds = athData.rounds;
      // console.log(rounds, $scope.averages);

      _.each(rounds, function(r){
        r.deviation = calculateDeviation(r.score, $scope.averages[r.round - 1].score);
      });

      return athData;
    });
  }, true);

  // Test values.
  // $scope.formData.name = 'Adam Campbell';
  // $scope.formData.board = 459747;

  // Table sorting.
  $scope.predicate = 'place';
  $scope.reverse = false;


  function calculateDeviation(score, average) {
    if (score > 0 && average > 0) {
      var deviation = -(average - score) / average;
      return Math.round((deviation * 100) * 10) / 10;
    } else {
      return '--';
    }
  }

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

      $scope.scores = [];
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