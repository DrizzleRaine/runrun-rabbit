'use strict';

var uuid = require('node-uuid');
var promise = require('promise');
var usernameService = require('../services/username.js');

module.exports.build = function buildUserRepo() {
    var redisClient = require('./redisFactory.js').createClient();

    // Lifetime of user accounts associated only with a cookie (rather than, for example, an OpenID token)
    var UNAUTHENTICATED_USER_EXPIRY = 86400;

    var _get = promise.denodeify(redisClient.get);
    var setnx = promise.denodeify(redisClient.setnx);
    var del = promise.denodeify(redisClient.del);
    var exists = promise.denodeify(redisClient.exists);
    var expire = promise.denodeify(redisClient.expire);
    var persist = promise.denodeify(redisClient.persist);
    var hget = promise.denodeify(redisClient.hget);
    var hgetall = promise.denodeify(redisClient.hgetall);
    var hset = promise.denodeify(redisClient.hset);
    var hmset = promise.denodeify(redisClient.hmset);
    var hsetnx = promise.denodeify(redisClient.hsetnx);
    var hdel = promise.denodeify(redisClient.hdel);

    var saveUser = function(userId, username) {
        return hset(userId, 'name', username)
            .then(expire(userId, 1800))
            .then(function() {
                return { playerId: userId };
            });
    };
    var tryStealUsername = function(userId, username) {
        return hget('names', username)
            .then(exists)
            .then(function(doesExist) {
                if (doesExist) {
                    return { error: 'Sorry, that username is already taken' };
                } else {
                    return saveUser(userId, username);
                }
            });
    };
    var trySetUsername = function(userId, username) {
        return hsetnx('names', username, userId)
            .then(function(success) {
                if (success) {
                    return saveUser(userId, username);
                } else {
                    return tryStealUsername(userId, username);
                }
            });
    };

    var userRepo = {
        createUser: function(username, callback) {
            var error = usernameService.validate(username);
            if (error) {
                return promise.from({ error: error }).nodeify(callback);
            }

            var userId = 'player:' + uuid.v4();
            return trySetUsername(userId, username).nodeify(callback);
        },
        fetchUser: function (userId, callback) {
            return hgetall('player:' + userId + ':providers')
                .then(function(providers) {
                    if (providers) {
                        return hgetall(userId)
                            .then(function(user) {
                                user.providers = providers;
                                return user;
                            });
                    } else {
                        return expire(userId, UNAUTHENTICATED_USER_EXPIRY)
                            .then(function (result) {
                                if (result) {
                                    return hgetall(userId);
                                } else {
                                    return null;
                                }
                            });
                    }
                })
                .nodeify(callback);
        },
        updateUsername: function(userId, username, callback) {
            var error = usernameService.validate(username);
            if (error) {
                return promise.from({ error: error }).nodeify(callback);
            }

            var previousName = null;

            return hget(userId, 'name')
                .then(function(prev) {
                    previousName = prev;

                    if (previousName !== username) {
                        return trySetUsername(userId, username)
                        .then(function(result) {
                            if (previousName) {
                                return hdel('names', previousName)
                                    .then(function() {
                                        return result;
                                    });
                            } else {
                                return result;
                            }
                        });
                    } else {
                        return { playerId: userId };
                    }
                })
                .nodeify(callback);
        },
        updateProfile: function(userId, profile, callback) {
            var whitelist = ['gravatar'];
            var filteredProfile = {};

            for (var prop in profile) {
                if (whitelist.indexOf(prop) !== -1) {
                    filteredProfile[prop] = profile[prop];
                }
            }

            return hmset(userId, filteredProfile).nodeify(callback);
        },
        registerAccount: function(userId, provider, providerId, providerUsername, callback) {
            var key = 'external:' + provider + ':' + providerId;
            return setnx(key, userId)
                .then(function(result) {
                    if (result) {
                        return persist(userId)
                            .then(hset('player:' + userId + ':providers', provider, providerUsername))
                            .then(hset('player:' + userId + ':providerIds', provider, providerId))
                            .then(function() {
                                return true;
                            });
                    } else {
                        return false;
                    }
                }).nodeify(callback);
        },
        unregisterAccount: function(userId, provider, callback) {
            return hget('player:' + userId + ':providerIds', provider)
                .then(function(providerId) {
                    if (providerId) {
                        return del('external:' + provider + ':' + providerId)
                            .then(hdel('player:' + userId + ':providers', provider))
                            .then(hdel('player:' + userId + ':providerIds', provider));
                    }
                })
                .nodeify(callback);
        },
        getUserForAccount: function(provider, providerId, callback) {
            return _get('external:' + provider + ':' + providerId).nodeify(callback);
        }
    };

    return userRepo;
};