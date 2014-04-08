'use strict';

var callback = require('../../../..' + (process.env.SOURCE_ROOT || '') + '/server/config/passport/facebook.js');
var assert = require('chai').assert;
var userRepoFactory = require('../../../..' + (process.env.SOURCE_ROOT || '') + '/server/repositories/user.js');
var mockRedis = require('node-redis-mock');

describe('facebook authentication callback', function() {
    var request, userRepo;

    beforeEach(function() {
        request = {
            session: {}
        };
        userRepo = userRepoFactory.build();
    });

    afterEach(function(done) {
        mockRedis.createClient().flushdb(function (err) {
            assert.isNull(err);
            done();
        });
    });

    describe('user not logged in', function() {
        describe('new facebook account', function() {

            it('should create new user using the facebook username', function(done) {
                var profile = { username: 'facebook.user', displayName: 'Facebook User' };

                callback(request, null, null, profile, function(error, authorised) {
                    assert.isNull(error);
                    assert.isTrue(authorised);
                    assert.isDefined(request.session.playerId);

                    userRepo.fetchUser(request.session.playerId)
                        .then(function (user) {
                            assert.equal(profile.username, user.name);
                            done();
                        })
                        .done();
                });
            });

            it('should register the facebook account with the newly created user', function(done) {
                var profile = { id: '12345678', username: 'facebook.user', displayName: 'Facebook User' };

                callback(request, null, null, profile, function(error, authorised) {
                    assert.isNull(error);
                    assert.isTrue(authorised);
                    assert.isDefined(request.session.playerId);

                    userRepo.getUserForAccount('facebook', profile.id)
                        .then(function (playerId) {
                            assert.equal(playerId, request.session.playerId);
                            done();
                        })
                        .done();
                });
            });

            it('should fall back to the display name when no username is set', function(done) {
                var profile = { displayName: 'Facebook User' };

                callback(request, null, null, profile, function(error, authorised) {
                    assert.isNull(error);
                    assert.isTrue(authorised);
                    assert.isDefined(request.session.playerId);

                    userRepo.fetchUser(request.session.playerId)
                        .then(function (user) {
                            assert.equal(profile.displayName, user.name);
                            done();
                        })
                        .done();
                });
            });

            it('should fall back to an automatically generated name when no username or displayName is set', function(done) {
                var profile = { };

                callback(request, null, null, profile, function(error, authorised) {
                    assert.isNull(error);
                    assert.isTrue(authorised);
                    assert.isDefined(request.session.playerId);

                    userRepo.fetchUser(request.session.playerId)
                        .then(function (user) {
                            assert.isString(user.name);
                            assert.ok(user.name);
                            done();
                        })
                        .done();
                });
            });

        });

        describe('registered facebook account', function() {
            it('should log in as the registered user', function(done) {
                var playerId = null;
                userRepo.createUser('User1')
                    .then(function(result) {
                        playerId = result.playerId;
                        return userRepo.registerAccount(result.playerId, 'facebook', '12345678');
                    })
                    .then(function() {
                        var profile = { id: '12345678', username: 'user.name' };
                        callback(request, null, null, profile, function(error, authorised) {
                            assert.isNull(error);
                            assert.isTrue(authorised);
                            assert.equal(request.session.playerId, playerId);
                            done();
                        });
                    })
                    .done();
            });
        });
    });

    describe('User logged in', function() {
        it('should add new facebook account to current user', function(done) {
            userRepo.createUser('User1')
                .then(function(result) {
                    request.session.playerId = result.playerId;
                    var profile = { id: '12345678', username: 'user.name' };
                    callback(request, null, null, profile, function (error, authorised) {
                        assert.isNull(error);
                        assert.isTrue(authorised);
                        userRepo.getUserForAccount('facebook', '12345678', function(error, playerId) {
                            assert.equal(result.playerId, playerId);
                            done();
                        });
                    });
                });
        });

        it('should return an error if facebook account is already mapped to a user', function(done) {
            var playerId1 = null;
            var playerId2 = null;

            userRepo.createUser('user1')
                .then(function (result) {
                    playerId1 = result.playerId;
                })
                .then(function() {
                    return userRepo.createUser('user2');
                })
                .then(function (result) {
                    playerId2 = result.playerId;
                })
                .then(function() {
                    return userRepo.registerAccount(playerId1, 'facebook', '12345678');
                })
                .then(function() {
                    request.session.playerId = playerId2;
                    var profile = { id: '12345678', username: 'user.name' };
                    callback(request, null, null, profile, function(error, authorised, message) {
                        assert.isNull(error);
                        assert.isFalse(authorised);
                        assert.isString(message);
                        done();
                    });
                })
                .done();
        });
    });
});