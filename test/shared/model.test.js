'use strict';

var modelFactory = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/model.js');
var sinon = require('sinon');
var assert = require('chai').assert;

describe('model', function() {
    var testLevel = {
        width: 5,
        height: 5,
        sources: [ { x: 0, y: 2, update: sinon.spy(), init: sinon.spy() } ],
        sinks: [ { x:4, y:2, player: null, update: sinon.spy() } ]
    };

    var model;
    var gameData;
    var gameTime;

    beforeEach(function() {
        gameData = {
            totalPlayers: 2,
            level: testLevel,
            random: {
                nextByte: sinon.spy()
            }
        };

        model = modelFactory.build(gameData);
        gameTime = 0;
    });

    it('should prevent placing arrows on top of other fixtures', function() {
        model.addArrow(0, {
            x: model.level.sinks[0].x,
            y: model.level.sinks[0].y,
            direction: 0,
            from: 0
        }, 0);

        model.addArrow(0, {
            x: model.level.sources[0].x,
            y: model.level.sources[0].y,
            direction: 0,
            from: 0
        }, 0);

        assert.isUndefined(model.getActiveArrow(0, model.level.sinks[0].x, model.level.sinks[0].y).arrow, 0);
        assert.isUndefined(model.getActiveArrow(0, model.level.sources[0].x, model.level.sources[0].y).arrow, 0);
    });
});