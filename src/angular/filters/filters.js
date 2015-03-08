/**
 * @module filters
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';
    var angular = require('angular');

    return angular.module('np.filters', [])
        //
        // https://github.com/newpointer/commons-js/issues/4
        .filter('capitalizeFirst', [function(){
            return function(text){
                return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
            };
        }])
        //
        // https://github.com/newpointer/commons-js/issues/5
        .filter('share', ['$filter', function($filter){
            return function(number, maxFractionSize){
                if (number > 100) {
                    return $filter('number')(number, maxFractionSize);
                }

                var numberText = $filter('number')(
                    number,
                    maxFractionSize === 0 ? 0 : maxFractionSize || 10
                );

                var text = /[.,]/.test(numberText) ?
                    numberText.replace(/[0]+$/, '').replace(/[.,]$/, '') :
                    numberText;

                return text;
            };
        }])
        //
        .filter('numberOrMessage', ['$filter', function($filter){
            return function(number, zeroMessage){
                if (!number && zeroMessage) {
                    return zeroMessage;
                }

                return $filter('number')(number);
            };
        }])
        //
        .filter('multiline', [function(){
            return function(text, criteria, criteriaLength){
                if (_.isBlank(text) || text.length < criteriaLength) {
                    return text;
                }

                var index, lines, i;

                if (criteria === 'line') {
                    lines = text;

                    for (i = criteriaLength; i < text.length; i += criteriaLength) {
                        index = lines.indexOf(' ', i);
                        lines = _.splice(lines, index, 1, '\n');
                    }
                } else {
                    index = text.indexOf(' ', criteria === 'middle' ? text.length / 2 : 0);
                    lines = _.splice(text, index, 1, '\n');
                }

                return lines;
            };
        }]);
    //
});
