/**
 * @module filters
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';
    var moduleConfig = module.config();

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
        }]);
    //
});
