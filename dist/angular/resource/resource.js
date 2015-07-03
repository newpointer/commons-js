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
            var npResource = {

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
                },

                multiRequest: function(httpConfigs, requestConfig, options) {
                    requestConfig = requestConfig || {};
                    options = options || {};

                    if (options.previousRequest) {
                        options.previousRequest.abort();
                    }

                    var requests            = {},
                        promises            = [],
                        completePromises    = [];

                    _.each(httpConfigs, function(httpConfig, key){
                        var request = npResource.request(httpConfig, requestConfig, {
                            success: function(data, status) {
                                requests[key].response = {
                                    data: data,
                                    status: status,
                                    hasError: false
                                };
                            },
                            error: function(data, status) {
                                requests[key].response = {
                                    data: data,
                                    status: status,
                                    hasError: true
                                };
                            }
                        });

                        requests[key] = {
                            request: request,
                            response: null
                        };

                        promises.push(request.promise);
                        completePromises.push(request.completePromise);
                    });

                    var promise = $q.all(promises).then(
                        function(){
                            if (_.isFunction(options.success)) {
                                options.success(requests);
                            }
                        },
                        function(){
                            if (_.isFunction(options.error)) {
                                options.error(requests);
                            }
                        }
                    );

                    var completePromise = $q.all(completePromises);

                    return {
                        promise: promise,
                        completePromise: completePromise,
                        abort: function() {
                            _.each(requests, function(r){
                                r.request.abort();
                            });
                        },
                        isComplete: function() {
                            var complete;

                            _.each(requests, function(r){
                                complete = r.request.isComplete();
                                return complete;
                            });

                            return complete;
                        }
                    };
                }
            };

            return npResource;
        }]);
    //
});
