'use strict';

var route = require('../../..' + (process.env.SOURCE_ROOT || '') + '/server/routes/multiplayer.js');
var assert = require('chai').assert;
var sinon = require('sinon');

describe('Multiplayer route', function() {
    it('should return the multiplayer game view', function() {
        var request = {};

        var response = {
            sendfile: sinon.spy()
        };

        route(request, response);

        assert.isTrue(response.sendfile.calledWith('game.html'));
    });
});