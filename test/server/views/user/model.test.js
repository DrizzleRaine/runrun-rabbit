'use strict';

var factory = require('../../../..' + (process.env.SOURCE_ROOT || '') + '/server/views/user/model.js');

var assert = require('chai').assert;

describe('User ViewModel', function() {
    it('should return underlying properties of the user', function() {
        var user = { name: 'TestUser' };
        var viewModel = factory.create(user);
        assert.equal(viewModel.name, user.name);
    });

    describe('avatar', function() {
        it('should return a default image when user has no gravatar email', function() {
            var user = { name: 'TestUser' };
            var viewModel = factory.create(user);
            var result = viewModel.avatar('200');

            assert.isString(result);
            assert.notEqual(result.indexOf('s=200'), -1);
        });

        it('should return a url for an avatar of the correct size', function() {
            var user = { name: 'TestUser', gravatar: 'test@example.com' };
            var viewModel = factory.create(user);
            var result = viewModel.avatar('200');

            assert.isString(result);
            assert.notEqual(result.indexOf('s=200'), -1);
        });
    });
});