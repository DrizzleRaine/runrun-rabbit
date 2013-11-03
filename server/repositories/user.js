'use strict';

var uuid = require('node-uuid');
var promise = require('promise');

module.exports.build = function buildUserRepo(redisClient) {
    var hsetnx = promise.denodeify(redisClient.hsetnx);
    var hset = promise.denodeify(redisClient.hset);
    var hget = promise.denodeify(redisClient.hget);
    var exists = promise.denodeify(redisClient.exists);

    var userRepo = {
        createUser: function(username, callback) {
            var userId = 'player:' + uuid.v4();

            var tryAddUsername = hsetnx('names', username, userId);
            var saveUser = hset(userId, 'name', username).then(function() {
                return userId;
            });
            var tryStealUsername =
                hget('names', username)
                .then(exists)
                .then(function(doesExist) {
                    if (doesExist) {
                        throw new Error('Username already taken');
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
        }
    };

    return userRepo;
};