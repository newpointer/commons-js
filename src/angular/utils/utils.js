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
