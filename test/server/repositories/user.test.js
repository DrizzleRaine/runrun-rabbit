'use strict';

var factory = require('../../..' + (process.env.SOURCE_ROOT || '') + '/server/repositories/user.js');
var redisFactory = require('../../..' + (process.env.SOURCE_ROOT || '') + '/server/repositories/redisFactory.js');
var mockRedis = require('node-redis-mock');

var username = require('../../..' + (process.env.SOURCE_ROOT || '') + '/server/services/username.js');

var assert = require('chai').assert;
var promise = require('promise');
var sinon = require('sinon');

describe('User repository', function() {
    var userRepository;
    var redisClient = redisFactory.createClient();
    var del = promise.denodeify(redisClient.del);
    var hget = promise.denodeify(redisClient.hget);

    beforeEach(function() {
        userRepository = factory.build();
        sinon.stub(username, 'validate');
    });

    afterEach(function(done) {
        username.validate.restore();
        redisClient.flushdb(function (err) {
            assert.isNull(err);
            done();
        });
    });

    it('should persist new users with a default TTL', function(done) {
        var username = 'User1';

        userRepository.createUser(username)
            .then(function (result) {
                assert.isUndefined(result.error);
                var ttl = mockRedis.storage[result.playerId].expires;
                assert.isTrue(ttl > 0, 'Expected TTL ' + ttl + ' to be > 0');
                assert.isTrue(ttl <= 1800, 'Expected TTL ' + ttl + 'to be <= 1800');
                return hget(result.playerId, 'name');
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
                userRepository.createUser(username, function(err, result) {
                    assert.isNotNull(result.error);
                    done();
                });
            })
            .done();
    });

    it('should return error when the username is invalid', function(done) {
        var error = 'Username not valid';
        username.validate.returns(error);

        userRepository.createUser(null, function(err, result) {
            assert.equal(result.error, error);
            done();
        });
    });

    it('should allow username to be re-used when user has expired', function(done) {
        var username = 'User1';

        userRepository.createUser(username)
            .then(function(result) {
                return del(result.playerId);
            })
            .then(function() {
                return userRepository.createUser(username);
            })
            .then(function(result) {
                return hget(result.playerId, 'name');
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
            .then(function (result) {
                return userRepository.fetchUser(result.playerId);
            })
            .then(function (user) {
                assert.equal(user.name, username);
                done();
            })
            .done();
    });

    it('should extend user expiry time on read', function(done) {
        var playerId = null;
        userRepository.createUser('user1')
            .then(function (result) {
                playerId = result.playerId;
                return userRepository.fetchUser(result.playerId);
            }).then(function () {
                var ttl = mockRedis.storage[playerId].expires;
                assert.isTrue(ttl > 86000, 'Expected TTL ' + ttl + ' to be > 86000');
                done();
            })
            .done();
    });

    describe('renaming', function() {
        it('should allow users to change their name', function(done) {
            var playerId = null;
            userRepository.createUser('OriginalName')
                .then(function(result) {
                    playerId = result.playerId;
                    return userRepository.updateUsername(result.playerId, 'NewUsername');
                })
                .then(function(result) {
                    assert.isUndefined(result.error);
                    return userRepository.fetchUser(playerId);
                })
                .then(function(user) {
                    assert.equal(user.name, 'NewUsername');
                    done();
                })
                .done();
        });

        it('should not allow users to change their name when the new name is unavailable', function(done) {
            var playerId = null;

            userRepository.createUser('OriginalName')
                .then(function(result) {
                    playerId = result.playerId;
                })
                .then(function() {
                    return userRepository.createUser('NewUsername');
                })
                .then(function() {
                    return userRepository.updateUsername(playerId, 'NewUsername');
                })
                .then(function(result) {
                    assert.isString(result.error);
                    return userRepository.fetchUser(playerId);
                })
                .then(function(user) {
                    assert.equal(user.name, 'OriginalName');
                    done();
                })
                .done();
        });

        it('should allow a name to be taken by a new account once it is no longer in use', function(done) {
            userRepository.createUser('OriginalName')
                .then(function(result) {
                    return userRepository.updateUsername(result.playerId, 'NewUsername');
                })
                .then(function() {
                    return userRepository.createUser('OriginalName');
                })
                .then(function(result) {
                    assert.isUndefined(result.error);
                    assert.ok(result.playerId);
                    done();
                })
                .done();
        });

        it('should not return an error when attempting to update a user to their existing name', function(done) {
            var playerId = null;
            userRepository.createUser('OriginalName')
                .then(function(result) {
                    playerId = result.playerId;
                    return userRepository.updateUsername(result.playerId, 'OriginalName');
                })
                .then(function(result) {
                    assert.isUndefined(result.error);
                    assert.equal(result.playerId, playerId);
                    return userRepository.fetchUser(playerId);
                })
                .then(function(user) {
                    assert.equal(user.name, 'OriginalName');
                    done();
                })
                .done();
        });

        it('should return error when no username specified', function(done) {
            var error = 'Username not valid';
            username.validate.returns(error);

            userRepository.createUser('TestUser')
                .then(function(result) {
                    userRepository.updateUsername(result.playerId, null, function(err, result) {
                        assert.equal(result.error, error);
                        done();
                    });
                });
        });
    });

    describe('updateProfile', function() {
        it('should save the profile against the user', function(done) {
            var playerId = null;
            var profile = {
                gravatar: 'testuser@example.com'
            };
            userRepository.createUser('Test User')
                .then(function(result) {
                    playerId = result.playerId;
                    return userRepository.updateProfile(playerId, profile);
                })
                .then(function() {
                    return userRepository.fetchUser(playerId);
                })
                .then(function(user) {
                    assert.equal(user.gravatar, profile.gravatar);
                    done();
                })
                .done();
        });

        it('should only save whitelisted properties', function(done) {
            var playerId = null;
            var profile = {
                gravatar: 'testuser@example.com',
                name: 'New username',
                role: 'Admin'
            };
            userRepository.createUser('Test User')
                .then(function(result) {
                    playerId = result.playerId;
                    return userRepository.updateProfile(playerId, profile);
                })
                .then(function() {
                    return userRepository.fetchUser(playerId);
                })
                .then(function(user) {
                    assert.equal(user.gravatar, profile.gravatar);
                    assert.equal(user.name, 'Test User');
                    assert.isUndefined(user.role);
                    done();
                })
                .done();
        });
    });

    describe('registration', function() {
        it('should allow users to register with an external account', function(done) {
            var playerId;

            userRepository.createUser('user1')
                .then(function(result) {
                    playerId = result.playerId;
                    return userRepository.registerAccount(result.playerId, 'facebook', '12345678');
                })
                .then(function() {
                    return userRepository.getUserForAccount('facebook', '12345678');
                })
                .then(function(foundPlayerId) {
                    assert.equal(playerId, foundPlayerId);
                    done();
                })
                .done();
        });

        it('should remove TTL from user with registered account', function(done) {
            var playerId;

            userRepository.createUser('user1')
                .then(function(result) {
                    playerId = result.playerId;
                    return userRepository.registerAccount(result.playerId, 'facebook', '12345678');
                })
                .then(function() {
                    assert.equal(mockRedis.storage[playerId].expires, -1);
                    done();
                })
                .done();
        });

        it('should not reset expiry when refreshing users with a registered account', function(done) {
            var playerId;

            userRepository.createUser('user1')
                .then(function(result) {
                    playerId = result.playerId;
                    return userRepository.registerAccount(result.playerId, 'facebook', '12345678');
                })
                .then(function() {
                    return userRepository.fetchUser(playerId);
                })
                .then(function() {
                    assert.equal(mockRedis.storage[playerId].expires, -1);
                    done();
                })
                .done();
        });

        it('should not allow the same external account to be registered against two users', function(done) {
            var playerId1 = null;
            var playerId2 = null;

            userRepository.createUser('user1')
                .then(function (result) {
                    playerId1 = result.playerId;
                })
                .then(function() {
                    return userRepository.createUser('user2');
                })
                .then(function (result) {
                    playerId2 = result.playerId;
                })
                .then(function() {
                    return userRepository.registerAccount(playerId1, 'facebook', '12345678');
                })
                .then(function() {
                    return userRepository.registerAccount(playerId2, 'facebook', '12345678');
                })
                .then(function() {
                    return userRepository.getUserForAccount('facebook', '12345678');
                })
                .then(function(foundPlayerId) {
                    assert.equal(playerId1, foundPlayerId);
                    done();
                })
                .done();
        });

        it('should return a list of registered account providers along with the user', function(done) {
            var playerId;

            userRepository.createUser('user1')
                .then(function(result) {
                    playerId = result.playerId;
                    return userRepository.registerAccount(playerId, 'facebook', '12345678', 'facebook.username');
                })
                .then(function() {
                    return userRepository.registerAccount(playerId, 'twitter', '987654321', 'tweeter');
                })
                .then(function() {
                    return userRepository.fetchUser(playerId);
                })
                .then(function(user) {
                    assert.equal(user.providers.facebook, 'facebook.username');
                    assert.equal(user.providers.twitter, 'tweeter');
                    done();
                })
                .done();
        });

        it('should allow users to unregister an external account', function(done) {
            var playerId;

            userRepository.createUser('user1')
                .then(function(result) {
                    playerId = result.playerId;
                    return userRepository.registerAccount(playerId, 'facebook', '12345678', 'facebook.username');
                })
                .then(function() {
                    return userRepository.registerAccount(playerId, 'twitter', '987654321', 'tweeter');
                })
                .then(function() {
                    return userRepository.unregisterAccount(playerId, 'facebook');
                })
                .then(function() {
                    return userRepository.fetchUser(playerId);
                })
                .then(function(user) {
                    assert.isUndefined(user.providers.facebook);
                    assert.equal(user.providers.twitter, 'tweeter');
                    done();
                })
                .done();
        });
    });
});