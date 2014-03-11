'use strict';

angular.module('sitesApp').filter('averageScore', function() {
	return function(items) {

		var count = items.length;
		var averages = [];

		_.each(items, function(el) {

			var rounds = el.rounds;

			_.each(rounds, function(a) {

				if(!averages[a.round]) {
					averages[a.round] = {
						round: a.round,
						score: 0
					};
				}

				averages[a.round].score += +a.score;
			});

		});

		averages = _.map(averages, function(a) {
			return {
				round: a.round,
				score: Math.round((a.score / count) * 10) / 10
			};
		});

		return _.flatten(averages);
		
	};
});