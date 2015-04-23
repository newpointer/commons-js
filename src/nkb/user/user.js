/**
 * @module user
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';

                  require('jquery');
                  require('lodash');
    var angular = require('angular');

                  require('np.resource');

    return angular.module('nkb.user', ['np.resource'])
        //
        .factory('nkbUser', ['$log', '$rootScope', '$interval', 'npResource', 'nkbUserConfig', function($log, $rootScope, $interval, npResource, nkbUserConfig){

            var resourceConfig = nkbUserConfig.resource || {};

            //
            var pollingInterval = 60000, // 1 минута
                user,
                userRequest, loginRequest, logoutRequest;

            function applyUser(u) {
                var change = {
                    first: !isFetch(),
                    login: getUserId(user) !== getUserId(u)
                };

                user = u;

                $rootScope.$emit('nkb-user-apply', change);
            }

            function isFetch(u) {
                return user !== undefined;
            }

            function getUserId(u) {
                return u ? u.userId : null;
            }

            //
            function userLimitsResource(options) {
                return npResource.request({
                    method: 'GET',
                    url: resourceConfig['users.url'] + '/me/limits'
                }, null, options);
            }

            function loginResource(options) {
                return npResource.request({
                    method: 'POST',
                    url: resourceConfig['login.url'],
                    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                    data: $.param(options.loginData)
                }, null, options);
            }

            function logoutResource(options) {
                return npResource.request({
                    method: 'GET',
                    url: resourceConfig['logout.url']
                }, null, options);
            }

            //
            function fetchUser() {
                userRequest = userLimitsResource({
                    previousRequest: userRequest,
                    success: function(data) {
                        applyUser(data);
                    },
                    error: function(data, status) {
                        // status = 0 -- при принудительной отмене запросов
                        if (status !== 0) {
                            applyUser(null);
                        }
                    }
                });

                return userRequest;
            }

            function login(loginData, success, error) {
                if (logoutRequest) {
                    logoutRequest.abort();
                }

                loginRequest = loginResource({
                    loginData: loginData,
                    previousRequest: loginRequest,
                    success: function(data){
                        if (data.error) {
                            error(data);
                        } else {
                            fetchUser().promise.then(
                                function(){
                                    success();
                                },
                                function(){
                                    error(null);
                                }
                            );
                        }
                    },
                    error: function(){
                        error(null);
                    }
                });
            }

            function logout(success, error) {
                if (userRequest) {
                    userRequest.abort();
                }

                if (loginRequest) {
                    loginRequest.abort();
                }

                logoutRequest = logoutResource({
                    previousRequest: logoutRequest,
                    success: function(){
                        applyUser(null);
                        success();
                    },
                    error: error
                });
            }

            function polling() {
                fetchUser();

                $interval(function(){
                    if (userRequest && userRequest.isComplete()) {
                        fetchUser();
                    }
                }, pollingInterval);
            }

            //
            polling();

            // API
            return {

                user: function() {
                    return {
                        isFetch: isFetch,

                        isAuthenticated: function() {
                            return !!user;
                        },

                        getId: function() {
                            return user && user.userId;
                        },

                        getName: function() {
                            return user && user.userName;
                        },

                        getLogin: function() {
                            return user && user.userLogin;
                        },

                        getBalance: function() {
                            return user && user.balance;
                        },

                        getProductLimitsInfo: function(productName) {
                            var me = this;

                            if (!me.isAuthenticated()) {
                                return null;
                            }

                            return user.limits[productName];
                        },

                        isProductAvailable: function(productName) {
                            var me = this;

                            if (!me.isAuthenticated()) {
                                return false;
                            }

                            var productLimitsInfo = me.getProductLimitsInfo(productName);

                            if (!productLimitsInfo) {
                                return false;
                            }

                            if (productLimitsInfo['unlimited'] ||
                                    productLimitsInfo['amount'] > 0 ||
                                    productLimitsInfo['price'] <= user.balance) {
                                return true;
                            }

                            return false;
                        }
                    };
                },

                fetchUser: function() {
                    return fetchUser().promise;
                },

                login: login,
                logout: logout
            };
        }]);
    //
});
