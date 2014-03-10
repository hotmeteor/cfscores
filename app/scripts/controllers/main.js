'use strict';

angular.module('sitesApp')
	.controller('MainCtrl', function($scope, $http) {

		// we will store our form data in this object
		$scope.submitted = false;
		$scope.formData = {};

		// Test values.
		// $scope.formData.name = 'Adam Campbell';
		// $scope.formData.board = 432713;

		// Table sorting.
		$scope.predicate = 'place';
		$scope.reverse = false;


		function requestSuccess(data) {
			$scope.submitted = false;
			$scope.loading = false;

			$scope.scores = data.scores;
			$scope.averages = data.averages;
		}

		function requestError(data) {
			$scope.message = data;
			$scope.loading = false;
		}

		$scope.setId = function(id) {
			$scope.formData.board = id;
		};

		$scope.submit = function(isValid) {

			$scope.submitted = true;

			if (isValid) {

				$scope.loading = true;

				$http.post('/api/leaderboard', {
					id: $scope.formData.board,
					name: $scope.formData.name
				})
					.success(requestSuccess)
					.error(requestError);

			}

		};

	});