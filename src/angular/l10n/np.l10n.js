/**
 * @module l10n
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

    var l10n    = require('./l10n'),
        angular = require('angular');

    return angular.module('np.l10n', [])
        //
        .factory('npL10n', ['$log', '$location', '$rootScope', function($log, $location, $rootScope){
            //
            angular.extend($rootScope, l10n.i18n.translateFuncs);

            // API
            return {
                l10n: function() {
                    return {
                        getLang: function() {
                            return l10n.getLang();
                        },
                        currentUrlWithLang: function(lang) {
                            return l10n.urlWithLang($location.absUrl(), lang);
                        },
                        urlWithLang: l10n.urlWithLang
                    };
                }
            };
        }]);
    //
});
