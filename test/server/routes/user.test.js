'use strict';

var routeFactory = require('../../..' + (process.env.SOURCE_ROOT || '') + '/server/routes/user.js');
var userRepoFactory = require('../../..' + (process.env.SOURCE_ROOT || '') + '/server/repositories/user.js');
var mockRedis = require('node-redis-mock');
var sinon = require('sinon');
var assert = require('chai').assert;

describe('User route', function() {
    var request, response, route, userRepo;

    beforeEach(function() {
        request = {
            session: {},
            body: {},
            flash: sinon.stub()
        };
        response = {
            render: sinon.spy(),
            redirect: sinon.spy()
        };
        route = routeFactory();
        userRepo = userRepoFactory.build();
    });

    afterEach(function(done) {
        mockRedis.createClient().flushdb(function (err) {
            assert.isNull(err);
            done();
        });
    });

    describe('details', function() {
        describe('GET', function() {
            it('should display the user details view', function(done) {
                route['/user']['/details'].get(request, response);

                var token = setInterval(function() {
                    if (response.render.called) {
                        clearInterval(token);
                        assert.isTrue(response.render.calledWith('user/details'));
                        assert.isFalse(response.render.lastCall.args[1].persisted);
                        done();
                    }
                }, 10);
            });

            it('should display any preceding errors', function(done) {
                var errorMessage = 'Login failed';
                request.flash.withArgs('error').returns(errorMessage);

                route['/user']['/details'].get(request, response);

                var token = setInterval(function() {
                    if (response.render.called) {
                        clearInterval(token);
                        assert.isTrue(response.render.calledWith('user/details'));
                        assert.equal(response.render.lastCall.args[1].error, errorMessage);
                        done();
                    }
                }, 10);
            });

            it('should indicate when the current user is persisted', function(done) {
                userRepo.createUser('TestUser')
                    .then(function(result) {
                        request.session.playerId = result.playerId;
                        route['/user']['/details'].get(request, response);

                        var token = setInterval(function() {
                            if (response.render.called) {
                                clearInterval(token);
                                assert.isTrue(response.render.calledWith('user/details'));
                                assert.isTrue(response.render.lastCall.args[1].persisted);
                                done();
                            }
                        }, 10);
                    }).done();
            });

            it('should display a unique default username for new users', function(done) {
                var response2 = { render: sinon.spy() };

                route['/user']['/details'].get(request, response);
                route['/user']['/details'].get(request, response2);

                var token = setInterval(function() {
                    if (response.render.called && response2.render.called) {
                        clearInterval(token);

                        var username1 = response.render.lastCall.args[1].username;
                        var username2 = response2.render.lastCall.args[1].username;

                        assert.isString(username1);
                        assert.isString(username2);

                        assert.notEqual(username1, username2);

                        done();
                    }
                }, 10);
            });
        });

        describe('POST', function() {
            it('should persist additional details', function(done) {
                userRepo.createUser('TestUser')
                    .then(function(result) {
                        request.session.playerId = result.playerId;
                        request.body.gravatar = 'test@example.com';
                        route['/user']['/details'].post(request, response);

                        var token = setInterval(function() {
                            if (response.redirect.called) {
                                clearInterval(token);
                                userRepo.fetchUser(result.playerId)
                                    .then(function(user) {
                                        assert.equal(user.gravatar, 'test@example.com');
                                        done();
                                    })
                                    .done();
                            }
                        }, 10);
                    })
                    .done();
            });
        });
    });

    describe('POST /name', function() {
        describe('new user', function() {
            it('should create a new user when username is available', function(done) {
                request.body.username = 'User1';

                route['/user']['/name'].post(request, response);

                var token = setInterval(function() {
                    if (response.redirect.called) {
                        clearInterval(token);
                        assert.isTrue(response.redirect.calledWith('/user/details'));
                        assert.isDefined(request.session.playerId);

                        userRepo.fetchUser(request.session.playerId, function(error, user) {
                            assert.equal('User1', user.name);
                            done();
                        });
                    }
                }, 10);
            });

            it('should return an error when username is not available', function(done) {
                userRepo.createUser('User1').then(function() {
                    request.body.username = 'User1';
                    route['/user']['/name'].post(request, response);

                    var token = setInterval(function() {
                        if (response.render.called) {
                            clearInterval(token);
                            assert.isTrue(response.render.calledWith('user/details'));
                            assert.isDefined(response.render.firstCall.args[1].error);
                            done();
                        }
                    }, 10);
                }).done();
            });
        });

        describe('logged in user', function() {
            it('should update the name of the current user', function(done) {
                userRepo.createUser('OriginalName')
                    .then(function(result) {
                        request.session.playerId = result.playerId;
                        request.body.username = 'NewName';
                        route['/user']['/name'].post(request, response);

                        var token = setInterval(function() {
                            if (response.redirect.called) {
                                clearInterval(token);
                                userRepo.fetchUser(result.playerId)
                                    .then(function(user) {
                                        assert.equal(user.name, 'NewName');
                                        done();
                                    })
                                    .done();
                            }
                        }, 10);
                    }).done();
            });
        });
    });

    describe('POST /remove-account', function() {
        it('should remove the external account from the user', function(done) {
            var playerId;
            userRepo.createUser('TestUser')
                .then(function(result) {
                    playerId = result.playerId;
                    return userRepo.registerAccount(playerId, 'facebook', '12345678', 'test.user');
                })
                .then(function() {
                    request.session.playerId = playerId;
                    request.body.provider = 'facebook';

                    route['/user']['/remove-account'].post(request, response);

                    var token = setInterval(function() {
                        if (response.redirect.called) {
                            clearInterval(token);
                            userRepo.fetchUser(playerId)
                                .then(function(user) {
                                    assert.isUndefined(user.providers);
                                    done();
                                })
                                .done();
                        }
                    }, 10);
                })
                .done();
        });
    });
});