/**
 * @module np.directives
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

                          require('./styles/directives.less');

    // var template        = require('./views/directives.html'),
    //     templateData, viewTemplates;

    var $               = require('jquery'),
        _               = require('lodash'),
        i18n            = require('i18n'),
        angular         = require('angular');
        // templateUtils   = require('template-utils');

    //
    function fadeout(element, opacity, duration) {
        // TODO заменить на CSS
        element.stop(true, true).animate({
            opacity: opacity
        }, {
            queue: false,
            duration: duration,
            done: function(){
                if (opacity === 0) {
                    element.hide();
                }
            }
        });
    }

    function fadein(element, opacity, duration) {
        // TODO заменить на CSS
        element.stop(true, true).fadeTo(0, 0).show().animate({
            opacity: opacity
        }, {
            queue: false,
            duration: duration
        });
    }

    //
    return angular.module('np.directives', [])
        //
        .run([function(){
            // templateData    = templateUtils.processTemplate(template);
            // viewTemplates   = templateData.templates;
        }])
        //
        // https://github.com/newpointer/commons-js/issues/2
        // Pluralize с форматированием attr.count фильтром number
        // Код ngPluralizeDirective AngularJS v1.3.13, отличия:
        //
        // Line #24023...
        //      - braceReplacement = startSymbol + numberExp + '-' + offset + endSymbol,
        //      + braceReplacement = startSymbol + '(' + numberExp + '-' + offset + ')|number' + endSymbol,
        //
        // Поддержка атрибута plural для динамического контроля свойств pluralize...
        //      plural = {
        //          count: <string expression>,
        //          when: <string>,
        //          [offset: <number>]
        //      }
        //
        // Поддержка собственных ключей для pluralize...
        //      plural = {
        //          count: <null | string | ... !undefined>,
        //          ...
        //      }
        //
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

                    // <<< Код поддержки атрибута plural
                    var pluralExp = attr.plural;

                    if (pluralExp) {
                        scope.$watch(pluralExp, function npPluralizeWatchAction(plural) {
                            offset = plural.offset || 0;
                            braceReplacement = startSymbol + '(' + plural.count + '-' + offset + ')|number' + endSymbol;

                            whens = scope.$eval(plural.when) || {};
                            whensExpFns = {};

                            angular.forEach(whens, function(expression, key) {
                                whensExpFns[key] = $interpolate(expression.replace(BRACE, braceReplacement));
                            });

                            var count = parseFloat(plural.count);
                            var countIsNaN = isNaN(count);

                            if (!countIsNaN && !(count in whens)) {
                                // If an explicit number rule such as 1, 2, 3... is defined, just use it.
                                // Otherwise, check it against pluralization rules in $locale service.
                                count = $locale.pluralCat(count - offset);
                            }

                            count = countIsNaN ?
                                (angular.isUndefined(plural.count) ? null : '' + plural.count) :
                                count;

                            if (count) {
                                var expression = whensExpFns[count] && whensExpFns[count].exp;

                                if (!expression) {
                                    throw new Error('No <when expression> in ' + plural.when + ' for count = ' + count + ', plural.count = ' + plural.count);
                                }

                                var text = $interpolate(whensExpFns[count].exp)(scope);

                                updateElementText(text);
                            }
                        });

                        return;
                    }
                    // >>>

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
               var o = parseFloat(attrs['npFadeoutOpacity']) || 0,
                   d = parseInt(attrs['npFadeoutDuration']) || 100;

                scope.$watch(attrs['npFadeout'], function(newVal, oldVal){
                   if (newVal) {
                       fadeout(element, o, d);
                   }
                });
            };
        }])
        //
        .directive('npFadein', [function(){
            return function(scope, element, attrs){
               var o = parseFloat(attrs['npFadeinOpacity']) || 1,
                   d = parseInt(attrs['npFadeinDuration']) || 100;

                scope.$watch(attrs['npFadein'], function(newVal, oldVal){
                   if (newVal) {
                       fadein(element, o, d);
                   }
                });
            };
        }])
        //
        // @Disabled
        // TypeError: element.hide is not a function
        // .directive('npLoader', ['$log', function($log){
        //     return {
        //         restrict: 'A',
        //         scope: {
        //             proxy: '=npLoader',
        //             type: '=npLoaderType'
        //         },
        //         template: '<div></div>',
        //         link: function(scope, element, attrs) {
        //             element.hide().find('> div').addClass(scope.type);

        //             if (!_.isObject(scope.proxy)) {
        //                 throw new Error('npLoader attribute must be object');
        //             }

        //             var fade            = _.toBoolean(attrs['fade']) || false,
        //                 fadeOpacity     = parseFloat(attrs['fadeOpacity']) || 0.75,
        //                 fadeDuration    = parseInt(attrs['fadeDuration']) || 250;

        //             _.extend(scope.proxy, {
        //                 show: function() {
        //                     if (fade) {
        //                         fadein(element, fadeOpacity, fadeDuration);
        //                     } else {
        //                         element.show();
        //                     }
        //                 },
        //                 hide: function() {
        //                     if (fade) {
        //                         fadeout(element, 0, fadeDuration);
        //                     } else {
        //                         element.hide();
        //                     }
        //                 }
        //             });
        //         }
        //     };
        // }])
        //
        .directive('npMessage', ['$log', '$sce', function($log, $sce){
            return {
                restrict: 'A',
                scope: {
                    proxy: '=npMessage'
                },
                // template: viewTemplates['message'].html,
                link: function(scope, element, attrs) {
                    element.hide();

                    if (!_.isObject(scope.proxy)) {
                        throw new Error('npMessage attribute must be object');
                    }

                    var fade            = _.toBoolean(attrs['fade']) || false,
                        fadeOpacity     = parseFloat(attrs['fadeOpacity']) || 0.75,
                        fadeDuration    = parseInt(attrs['fadeDuration']) || 250;

                    _.extend(scope.proxy, {
                        setMessageHtml: function(messageHtml) {
                            scope.messageHtml = $sce.trustAsHtml(messageHtml);
                        },
                        show: function() {
                            if (fade) {
                                fadein(element, fadeOpacity, fadeDuration);
                            } else {
                                element.show();
                            }
                        },
                        hide: function() {
                            if (fade) {
                                fadeout(element, 0, fadeDuration);
                            } else {
                                element.hide();
                            }
                        }
                    });

                    _.extend(scope, {
                        off: function() {
                            scope.proxy.hide();
                        }
                    });
                }
            };
        }])
        //
        .directive('npInlineEdit', ['$log', '$timeout', function($log, $timeout){
            return {
                restrict: 'A',
                scope: {
                    model: '=npInlineEdit',
                    proxy: '=proxy',
                    data: '=data'
                },
                // template: viewTemplates['inline-edit'].html,
                link: function(scope, element, attrs) {
                    //
                    var saveText        = attrs['saveText'] || '',
                        cancelText      = attrs['cancelText'] || '',
                        changeText      = attrs['changeText'] || '',
                        inputElement    = element.find('.inline-edit-input input');

                    element.find('.inline-edit-input .btn.save').attr('title', saveText);
                    element.find('.inline-edit-input .btn.cancel').attr('title', cancelText);
                    element.find('.inline-edit-on a').attr('title', changeText);

                    //
                    inputElement.keyup(function(e){
                        // esc
                        if (e.keyCode === 27) {
                            scope.$apply(function(){
                                scope.off();
                            });
                        } else
                        // enter
                        if (e.keyCode === 13) {
                            scope.$apply(function(){
                                scope.edit();
                            });
                        }
                    });

                    //
                    _.extend(scope, {
                        active: false,
                        on: function() {
                            if (!scope.active) {
                                initText();

                                scope.active = true;
                                element.addClass('active');
                            }

                            $timeout(function(){
                                inputElement.focus();
                            });
                        },
                        off: function() {
                            if (!scope.active) {
                                return;
                            }

                            scope.active = false;
                            element.removeClass('active');
                        },
                        edit: function() {
                            scope.off();

                            if (scope.newText === scope.oldText) {
                                return;
                            }

                            if (_.isFunction(scope.proxy.onEdit)) {
                                scope.proxy.onEdit(scope.newText, scope.oldText, scope.data);
                            }
                        }
                    });

                    _.extend(scope.proxy, {
                        on: function() {
                            scope.on();
                        },
                        off: function() {
                            scope.off();
                        }
                    });

                    function initText() {
                        var text = '' + scope.model;
                        scope.oldText = text;
                        scope.newText = text;
                    }
                }
            };
        }])
        //
        .directive('npInlineConfirm', ['$log', '$document', function($log, $document){
            return {
                restrict: 'A',
                scope: false,
                link: function(scope, element, attrs) {
                    var confirmText = attrs['confirmText'];

                    var confirmElement = $('<span>', {
                        html: '<i class="icon i-message-2"></i><span class="inline-confirm-text"></span>'
                    });

                    confirmElement.find('.inline-confirm-text').text(confirmText);

                    var confirmExp      = attrs['npInlineConfirm'],
                        confirmHTML     = confirmElement.html(),
                        originalHTML    = element.html(),
                        confirm         = true;

                    $document.click(function(e){
                        var target = $(e.target);
                        if (element.is(target) || element.find(target).length) {
                            doConfirm();
                        } else {
                            reset();
                        }
                    });

                    function setConfirmHTML() {
                        element.html(confirmHTML);
                    }

                    function setOriginalHTML() {
                        element.html(originalHTML);
                    }

                    function doConfirm() {
                        if (confirm) {
                            setConfirmHTML();
                        } else {
                            setOriginalHTML();
                            scope.$eval(confirmExp);
                        }

                        confirm = !confirm;
                    }

                    function reset() {
                        if (confirm) {
                            return;
                        }

                        setOriginalHTML();
                        confirm = true;
                    }
                }
            };
        }]);
    //
});
