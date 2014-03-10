'use strict';


angular.module('sitesApp')

// http://kurtfunai.com/2014/02/angular-directives-intro.html
.directive('submitButton', function($compile) {
	return {
		link: function(scope, elm, attrs) {
			var btnContents = $compile(elm.contents())(scope);
			scope.$watch(attrs.ngModel, function(value) {
				if (value) {
					elm.html(scope.$eval(attrs.submitButton));
					elm.attr('disabled', true);
				} else {
					elm.html('').append(btnContents);
					elm.attr('disabled', false);
				}
			});
		}
	};
});