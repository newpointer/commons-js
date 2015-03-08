/**
 * @module directives
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';
    var moduleConfig = module.config();

    var angular = require('angular');

    return angular.module('np.directives', [])
        //
        // https://github.com/newpointer/commons-js/issues/2
        // Pluralize с форматированием attr.count фильтром number
        // Код ngPluralizeDirective AngularJS v1.3.13, отличия:
        // Line #24023...
        //      - braceReplacement = startSymbol + numberExp + '-' + offset + endSymbol,
        //      + braceReplacement = startSymbol + '(' + numberExp + '-' + offset + ')|number' + endSymbol,
        .directive('npPluralize', ['$locale', '$interpolate', function($locale, $interpolate){
            var BRACE = /{}/g,
                IS_WHEN = /^when(Minus)?(.+)$/;

            return {
                restrict: 'EA',
                link: function(scope, element, attr) {
                    var numberExp = attr.count,
                        whenExp = attr.$attr.when && element.attr(attr.$attr.when), // we have {{}} in attrs
                        offset = attr.offset || 0,
                        whens = scope.$eval(whenExp) || {},
                        whensExpFns = {},
                        startSymbol = $interpolate.startSymbol(),
                        endSymbol = $interpolate.endSymbol(),
                        braceReplacement = startSymbol + '(' + numberExp + '-' + offset + ')|number' + endSymbol,
                        watchRemover = angular.noop,
                        lastCount;

                    angular.forEach(attr, function(expression, attributeName) {
                        var tmpMatch = IS_WHEN.exec(attributeName);
                        if (tmpMatch) {
                            var whenKey = (tmpMatch[1] ? '-' : '') + lowercase(tmpMatch[2]);
                            whens[whenKey] = element.attr(attr.$attr[attributeName]);
                        }
                    });
                    angular.forEach(whens, function(expression, key) {
                        whensExpFns[key] = $interpolate(expression.replace(BRACE, braceReplacement));
                    });

                    scope.$watch(numberExp, function ngPluralizeWatchAction(newVal) {
                        var count = parseFloat(newVal);
                        var countIsNaN = isNaN(count);

                        if (!countIsNaN && !(count in whens)) {
                            // If an explicit number rule such as 1, 2, 3... is defined, just use it.
                            // Otherwise, check it against pluralization rules in $locale service.
                            count = $locale.pluralCat(count - offset);
                        }

                        // If both `count` and `lastCount` are NaN, we don't need to re-register a watch.
                        // In JS `NaN !== NaN`, so we have to exlicitly check.
                        if ((count !== lastCount) && !(countIsNaN && isNaN(lastCount))) {
                            watchRemover();
                            watchRemover = scope.$watch(whensExpFns[count], updateElementText);
                            lastCount = count;
                        }
                    });

                    function updateElementText(newText) {
                        element.text(newText || '');
                    }
                }
            };
        }])
        //
        .directive('npFadeout', [function(){
            return function(scope, element, attrs){
                scope.$watch(attrs['npFadeout'], function(newVal, oldVal){
                   if (newVal) {
                       var o = parseFloat(attrs['npFadeoutOpacity']) || 0,
                           d = parseInt(attrs['npFadeoutDuration']) || 100;

                       element.stop(true, true).animate({
                           opacity: o
                       }, {
                           queue: false,
                           duration: d,
                           done: function(){
                               if (o === 0) {
                                   element.hide();
                               }
                           }
                       });
                   }
                });
            };
        }])
        //
        .directive('npFadein', [function(){
            return function(scope, element, attrs){
                scope.$watch(attrs['npFadein'], function(newVal, oldVal){
                   if (newVal) {
                       var o = parseFloat(attrs['npFadeinOpacity']) || 1,
                           d = parseInt(attrs['npFadeinDuration']) || 100;

                       element.stop(true, true).show().animate({
                           opacity: o
                       }, {
                           queue: false,
                           duration: d
                       });
                   }
                });
            };
        }]);
    //
});
