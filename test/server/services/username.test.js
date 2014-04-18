'use strict';

var service = require('../../..' + (process.env.SOURCE_ROOT || '') + '/server/services/username.js');

var assert = require('chai').assert;

describe('Username service', function() {
    describe('validate', function() {
        it('should return no error when the username is valid', function() {
            var error = service.validate('New username');
            assert.isUndefined(error);
        });

        it('should return error when no username specified', function() {
            var error = service.validate(null);
            assert.isString(error);
        });

        it('should return error when username is too short', function() {
            var error = service.validate('A');
            assert.isString(error);
        });

        it('should return error when username is too long', function() {
            var error = service.validate('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
            assert.isString(error);
        });
    });
});