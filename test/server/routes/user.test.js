'use strict';

var routeFactory = require('../../..' + (process.env.SOURCE_ROOT || '') + '/server/routes/user.js');
var userRepoFactory = require('../../..' + (process.env.SOURCE_ROOT || '') + '/server/repositories/user.js');
var mockRedis = require('redis-mock');
var sinon = require('sinon');
var assert = require('chai').assert;

describe('User route', function() {
    describe('details', function() {
        var request, response, route, userRepo;

        beforeEach(function() {
            request = {
                cookies: {},
                body: {}
            };
            response = {
                render: sinon.spy(),
                redirect: sinon.spy(),
                cookie: sinon.spy()
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

        describe('GET', function() {
            it('should display the user details view', function(done) {
                route['/user']['/details'].get(request, response);

                var token = setInterval(function() {
                    if (response.render.called) {
                        clearInterval(token);
                        assert.isTrue(response.render.calledWith('user/details'));
                        done();
                    }
                });
            });
        });

        describe('POST', function() {
            it('should create a new user when username is available', function(done) {
                request.body.username = 'User1';

                route['/user']['/details'].post(request, response);

                var token = setInterval(function() {
                    if (response.redirect.called) {
                        clearInterval(token);
                        assert.isTrue(response.redirect.calledWith('/user/details'));
                        assert.isTrue(response.cookie.called);

                        userRepo.fetchUser(response.cookie.firstCall.args[1], function(error, user) {
                            assert.equal('User1', user.name);
                            done();
                        });
                    }
                }, 10);
            });

            it('should return an error when username is not available', function(done) {
                userRepo.createUser('User1').then(function() {
                    console.log('User created');
                    request.body.username = 'User1';
                    route['/user']['/details'].post(request, response);

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
    });
});