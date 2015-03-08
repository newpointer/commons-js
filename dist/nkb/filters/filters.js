/**
 * @module filters
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';
    var moduleConfig = module.config();

    var angular = require('angular');

    return angular.module('nkb.filters', [])
        //
        .filter('isLastSalesVolume', ['appConfig', function(appConfig){
            return function(node){
                if (!node) {
                    return null;
                }

                return _.has(node, appConfig.meta.lastSalesVolumeField);
            };
        }])
        //
        .filter('lastSalesVolume', ['appConfig', function(appConfig){
            return function(node){
                if (!node) {
                    return null;
                }

                return node[appConfig.meta.lastSalesVolumeField] / appConfig.meta.currencyOrder;
            };
        }])
        //
        .filter('isBalance', [function(){
            return function(node){
                return node && node['balance'];
            };
        }])
        //
        .filter('balance', [function(){
            return function(node){
                if (!node) {
                    return null;
                }

                var value = node['balance'];

                if (!value) {
                    return null;
                }

                var years = _.isArray(value) ? _.clone(value) : [value];
                years.reverse();

                var formYear = node['balance_forms_' + _.last(years)];

                var forms = _.isArray(formYear) ? formYear : [formYear];

                return years.join(', ') + ' [' + forms.join(', ') + ']';
            };
        }])
        //
        .filter('balanceForms', [function(){
            return function(node){
                if (!node) {
                    return null;
                }

                var value = node['balance'];

                if (!value) {
                    return null;
                }

                var years       = _.isArray(value) ? _.clone(value) : [value],
                    formYear    = node['balance_forms_' + _.first(years)],
                    forms       = _.isArray(formYear) ? formYear : [formYear];

                return forms.join(', ');
            };
        }])
        //
        .filter('balanceByPeriod', [function(){
            return function(node){
                if (!node) {
                    return null;
                }

                var value = node['balance'];

                if (!value) {
                    return null;
                }

                var years = _.isArray(value) ? _.clone(value) : [value];
                years.reverse();

                var prevYear        = years[0],
                    yearsByPeriod   = [[prevYear]],
                    p               = 0,
                    str             = '',
                    year, i;

                for (i = 1; i < years.length; i++) {
                    year = years[i];

                    if (year - prevYear === 1) {
                        yearsByPeriod[p][1] = year;
                    } else {
                        yearsByPeriod[++p] = [year];
                    }

                    prevYear = year;
                }

                for (i = 0; i < yearsByPeriod.length; i++) {
                    str += yearsByPeriod[i].join('—') + (i < yearsByPeriod.length - 1 ? ', ' : '');
                }

                return str;
            };
        }])
        //
        .filter('OKVED', [function(){
            return function(node){
                if (!node) {
                    return null;
                }

                var okved       = node['okvedcode_bal'] || node['okvedcode_main'],
                    okvedText   = node['okved_bal_text'] || node['okved_main_text'];

                if (!okved || !okvedText) {
                    return null;
                }

                var okvedCode = _.chop(okved, 2).join('.');

                return okvedCode + ' ' + okvedText;
            };
        }]);
    //
});
