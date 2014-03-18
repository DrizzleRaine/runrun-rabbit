'use strict';

var uuid = require('node-uuid');
var promise = require('promise');

module.exports.build = function buildUserRepo() {
    var redisClient = require('./redisFactory.js').createClient();

    // Lifetime of user accounts associated only with a cookie (rather than, for example, an OpenID token)
    var UNAUTHENTICATED_USER_EXPIRY = 86400;

    var hsetnx = promise.denodeify(redisClient.hsetnx);
    var hset = promise.denodeify(redisClient.hset);
    var hget = promise.denodeify(redisClient.hget);
    var hgetall = promise.denodeify(redisClient.hgetall);
    var exists = promise.denodeify(redisClient.exists);
    var expire = promise.denodeify(redisClient.expire);

    function validateUsername(username) {
        if (!username) {
            return 'Please specify a username';
        } else if (username.length < 2) {
            return 'Please specify a username at least two characters long';
        } else if (username.length > 20) {
            return 'Please specify a username no moare than twenty characters long';
        }
    }

    var userRepo = {
        createUser: function(username, callback) {
            var error = validateUsername(username);
            if (error) {
                return promise.reject(error).nodeify(callback);
            }

            var userId = 'player:' + uuid.v4();

            var tryAddUsername = hsetnx('names', username, userId);
            var saveUser = hset(userId, 'name', username)
                .then(expire(userId, 1800))
                .then(function() {
                    return userId;
                });
            var tryStealUsername =
                hget('names', username)
                .then(exists)
                .then(function(doesExist) {
                    if (doesExist) {
                        return promise.reject('Sorry, that username is already taken');
                    } else {
                        return saveUser;
                    }
                });

            return tryAddUsername
                .then(function(success) {
                    if (success) {
                        return saveUser;
                    } else {
                        return tryStealUsername;
                    }
                })
                .nodeify(callback);
        },
        fetchUser: function (userId, callback) {
            return expire(userId, UNAUTHENTICATED_USER_EXPIRY)
                .then(function (result) {
                    if (result) {
                        return hgetall(userId);
                    } else {
                        return null;
                    }
                })
                .nodeify(callback);
        }
    };

    return userRepo;
};