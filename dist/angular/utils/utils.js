/**
 * @module utils
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                  require('lodash');
    var angular = require('angular');

    return angular.module('np.utils', [])
        //
        .factory('SimplePager', ['$log', function($log){
            return function(options) {
                options = options || {};

                var pageCount   = 0,
                    pageNumber  = 0;

                function reset(config) {
                    config = config || {};

                    pageCount = config.pageCount > 0 ? config.pageCount : 0;
                    pageNumber = config.pageNumber || 1;

                    if (pageNumber < 1) {
                        pageNumber = 1;
                    } else
                    if (pageNumber > pageCount) {
                        pageNumber = pageCount;
                    }
                }

                function hasPrevPage() {
                    return pageNumber > 1;
                }

                function hasNextPage() {
                    return pageNumber < pageCount;
                }

                return {
                    hasPrevPage: hasPrevPage,
                    hasNextPage: hasNextPage,

                    prevPage: function() {
                        if (hasPrevPage()) {
                            pageNumber--;
                        }

                        if (_.isFunction(options.prevPage)) {
                            options.prevPage(pageNumber);
                        }

                        return pageNumber;
                    },

                    nextPage: function() {
                        if (hasNextPage()) {
                            pageNumber++;
                        }

                        if (_.isFunction(options.nextPage)) {
                            options.nextPage(pageNumber);
                        }

                        return pageNumber;
                    },

                    getPageCount: function() {
                        return pageCount;
                    },

                    getPageNumber: function() {
                        return pageNumber;
                    },

                    getPageConfig: function() {
                        return {
                            pageCount: pageCount,
                            pageNumber: pageNumber
                        };
                    },

                    reset: function(config) {
                        reset(config);
                    }
                };
            };
        }])
        //
        .factory('npUtils', ['$log', '$timeout', function($log, $timeout){

            /*
             * loading
             *
             */
            function loading(operation, before, after, delay) {
                delay = delay || 500;

                var loadingId = _.uniqueId();

                process(loadingId, operation);

                function process(id, operation) {
                    var complete = false;

                    $timeout(function(){
                        if (!complete && id === loadingId) {
                            if (_.isFunction(before)) {
                                before();
                            }
                        }
                    }, delay);

                    operation(done);

                    function done() {
                        $timeout(function(){
                            if (id === loadingId) {
                                complete = true;

                                if (_.isFunction(after)) {
                                    after();
                                }
                            }
                        });
                    }
                }
            }

            // API
            var npUtils = {
                loading: loading
            };

            return npUtils;
        }]);
    //
});
