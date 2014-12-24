/**
 * @module l10n
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';
    var moduleConfig = module.config();

                          require('jquery');
                          require('jquery.cookie');

    var angular         = require('angular'),
        i18n            = require('i18n'),
        purl            = require('purl');

    //
    i18n.setConfig(moduleConfig['i18n-component']);

    function setLocale(lang) {
        var bundles = [],
            locale  = false;

        // dynamic require bundles
        require(moduleConfig.bundles, function(){
            angular.forEach(arguments, function(bundle){
                bundles.push(angular.fromJson(bundle));
            });
            check();
        });

        // dynamic require angular-locale_<lang>
        require(['text!angular-locale_' + lang + '.js'], function(localeScript){
            eval(localeScript);
            locale = true;
            check();
        });

        function check() {
            if (bundles.length === moduleConfig.bundles.length && locale) {
                i18n.setBundle(bundles);
                i18n.setLang(currentLang);
            }
        }
    }

    //
    var config      = moduleConfig.lang || {},
        langParam   = 'lang',
        currentLang;

    function resolveLang() {
        currentLang = getLangFromUrl() || getLangFromCookies() || config.defaultLang;
    }

    function getLangFromUrl() {
        var params  = purl().param(),
            lang    = params[langParam];

        if (!lang) {
            return null;
        }

        setLangToCookies(lang);

        return lang;
    }

    function urlWithLang(url, lang) {
        lang = lang || currentLang;

        var u       = purl(url),
            params  = u.param(),
            si      = url.indexOf('?'),
            res     = si > 0 ? url.substring(0, si) : url;

        params[langParam] = lang;

        res += '?' + $.param(params);

        return res;
    }

    function getLangFromCookies() {
        return $.cookie(langParam);
    }

    function setLangToCookies(lang) {
        $.cookie(langParam, lang, {
            path: '/',
            expires: 365 * 10
        });
    }

    function applyLang() {
        setLocale(currentLang);
    }

    resolveLang();
    applyLang();

    return angular.module('np.l10n', [])
        //
        .factory('npL10n', ['$log', '$location', '$rootScope', function($log, $location, $rootScope){
            //
            angular.extend($rootScope, i18n.translateFuncs);

            //
            $('body').addClass('lang-' + currentLang);

            // API
            return {
                l10n: function() {
                    return {
                        getLang: function() {
                            return currentLang;
                        },
                        currentUrlWithLang: function(lang) {
                            return urlWithLang($location.absUrl(), lang);
                        },
                        urlWithLang: urlWithLang
                    };
                }
            };
        }]);
    //
});
