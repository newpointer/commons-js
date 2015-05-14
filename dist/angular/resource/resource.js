/**
 * @module resource
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                  require('lodash');
    var angular = require('angular');

    return angular.module('np.resource', [])
        //
        .factory('npResource', ['$log', '$q', '$http', function($log, $q, $http){

            // API
            return {

                request: function(httpConfig, requestConfig, options) {
                    requestConfig = requestConfig || {};
                    options = options || {};

                    if (options.previousRequest) {
                        options.previousRequest.abort();
                    }

                    var canceler    = $q.defer(),
                        completer   = $q.defer(),
                        complete    = false;

                    var promise = $http(_.extend({
                        timeout: canceler.promise
                    }, httpConfig));

                    promise
                        .success(function(data, status){
                            if (_.isFunction(requestConfig.responseProcess)) {
                                data = requestConfig.responseProcess(data, status);
                            }

                            if (_.isFunction(options.success)) {
                                options.success(data, status);
                            }
                        })
                        .error(function(data, status){
                            if (_.isFunction(options.error)) {
                                options.error(data, status);
                            }
                        })
                        ['finally'](function(){
                            complete = true;
                            completer.resolve();
                        });

                    return {
                        promise: promise,
                        completePromise: completer.promise,
                        abort: function(){
                            canceler.resolve();
                        },
                        isComplete: function(){
                            return complete;
                        }
                    };
                }
            };
        }]);
    //
});
