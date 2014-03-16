'use strict';

var routeFactory = require('../../..' + (process.env.SOURCE_ROOT || '') + '/server/routes/user.js');
var userRepoFactory = require('../../..' + (process.env.SOURCE_ROOT || '') + '/server/repositories/user.js');
var sinon = require('sinon');

var assert = require('chai').assert;

describe('Multiplayer route', function() {
    describe('details', function() {
        var request, response, route, userRepo;

        beforeEach(function() {
            request = {
                cookies: {}
            };
            response = {
                sendFile: sinon.spy(),
                redirect: sinon.spy()
            };
            route = routeFactory();
            userRepo = {
                fetchUser: sinon.stub,
                createUser: sinon.spy
            };
            sinon.stub(userRepoFactory, 'build', function() {
                return userRepo;
            });
        });

        afterEach(function() {
            userRepoFactory.build.restore();
        });

        describe('GET', function() {
            it('should display the user details view', function() {
                route['/user']['/details'].get(request, response);
                assert.isTrue(response.sendFile.calledWith('details.html'));
            });
        });

        describe('POST', function() {
            it('should create a new user when username is available', function() {
//                request.params.username = 'User1';
//                assertTrue(userRepo.createUser.calledWith('User1'));
//                assert.isTrue(response.sendFile.calledWith('/user/details'));
            });

            it('should return an error when username is not available', function() {

            });
        });
    });
});