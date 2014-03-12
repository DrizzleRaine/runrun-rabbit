'use strict';

var factory = require('../../..' + (process.env.SOURCE_ROOT || '') + '/server/repositories/user.js');
var assert = require('chai').assert;

var mockRedis = require('redis-mock');

var promise = require('promise');

describe('User repository', function() {
    var userRepository;
    var redisClient = mockRedis.createClient();
    var del = promise.denodeify(redisClient.del);
    var hget = promise.denodeify(redisClient.hget);

    beforeEach(function() {
        userRepository = factory.build(mockRedis.createClient());
    });

    afterEach(function(done) {
        redisClient.flushdb(function (err) {
            assert.isNull(err);
            done();
        });
    });

    it('should persist new users with a default TTL', function(done) {
        var username = 'User1';

        userRepository.createUser(username)
            .then(function (userId) {
                var ttl = mockRedis.storage[userId].expires;
                assert.isTrue(ttl > 0, 'Expected TTL ' + ttl + ' to be > 0');
                assert.isTrue(ttl <= 1800, 'Expected TTL ' + ttl + 'to be <= 1800');
                return hget(userId, 'name');
            })
            .then(function(actualUsername) {
                assert.equal(actualUsername, username);
                done();
            })
            .done();
    });

    it('should return error when username already exists', function(done) {
        var username = 'User1';

        userRepository.createUser(username)
            .then(function() {
                userRepository.createUser(username, function(err) {
                    assert.isNotNull(err);
                    done();
                });
            })
            .done();
    });

    it('should allow username to be re-used when user has expired', function(done) {
        var username = 'User1';

        userRepository.createUser(username)
            .then(del)
            .then(function() {
                return userRepository.createUser(username);
            })
            .then(function(secondUserId) {
                return hget(secondUserId, 'name');
            })
            .then(function(actualUsername) {
                assert.equal(actualUsername, username);
                done();
            })
            .done();
    });

    it('should return user details for an existing user', function(done) {
        var username = 'User1';

        userRepository.createUser(username)
            .then(function (userId) {
                return userRepository.fetchUser(userId);
            })
            .then(function (user) {
                assert.equal(user.name, username);
                done();
            })
            .done();
    });

    it('should extend user expiry time', function(done) {
        userRepository.createUser('user1')
            .then(function (userId) {
                userRepository.extendUser(userId);
                return userId;
            }).then(function (userId) {
                var ttl = mockRedis.storage[userId].expires;
                assert.isTrue(ttl > 86000, 'Expected TTL ' + ttl + ' to be > 86000');
                done();
            })
            .done();
    });
});