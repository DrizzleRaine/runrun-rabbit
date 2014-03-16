'use strict';

var routeFactory = require('../../..' + (process.env.SOURCE_ROOT || '') + '/server/routes/multiplayer.js');
var userRepo = require('../../..' + (process.env.SOURCE_ROOT || '') + '/server/repositories/user.js');
var redisFactory = require('../../..' + (process.env.SOURCE_ROOT || '') + '/server/repositories/redisFactory.js');

var sinon = require('sinon');
var assert = require('chai').assert;

var mockRedis = require('redis-mock');

describe('Multiplayer route', function() {
    beforeEach(function() {
        sinon.stub(redisFactory, 'createClient', mockRedis.createClient);
    });

    afterEach(function(done) {
        mockRedis.createClient().flushdb(function (err) {
            assert.isNull(err);
            done();
        });
        redisFactory.createClient.restore();
    });

    describe('root', function() {
        var request, response, route;

        beforeEach(function() {
            request = {
                cookies: {}
            };
            response = {
                redirect: sinon.spy()
            };
            route = routeFactory();
        });

        it('should direct new users to pick a username', function() {
            route['/multiplayer'].get(request, response);

            assert.isTrue(response.redirect.calledWith('/user/details'));
        });

        it('should direct expired users to pick a username', function(done) {
            request.cookies.playerId = 'player:134d7b1b-3924-4566-ad4b-a3fb3a91e591';
            route['/multiplayer'].get(request, response);

            var token = setInterval(function() {
                if (response.redirect.called) {
                    assert.isTrue(response.redirect.calledWith('/user/details'));
                    clearInterval(token);
                    done();
                }
            }, 10);
        });

        it('should direct existing users to a multiplayer game and extend expiry time', function(done) {
            userRepo.build().createUser('User1')
                .then(function(userId) {
                    request.cookies.playerId = userId;
                    route['/multiplayer'].get(request, response);
                    var token = setInterval(function() {
                        if (response.redirect.called) {
                            assert.isTrue(response.redirect.calledWith('/multiplayer/game'));
                            clearInterval(token);
                            done();
                        }
                    }, 10);
                });
        });
    });

    describe('game', function() {
        var request, response, route;

        beforeEach(function() {
            request = {};
            response = {
                sendFile: sinon.spy()
            };
            route = routeFactory();
        });

        it('should start a multiplayer game', function() {
            route['/multiplayer']['/game'].get(request, response);

            assert.isTrue(response.sendFile.calledWith('game.html'));
        });
    });
});