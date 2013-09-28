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

    it('should prevent placing arrows on top of other arrows', function() {
        var firstArrow = model.addArrow(0, {
            x: 2,
            y: 2,
            direction: 0,
            from: 0
        });

        var result = model.addArrow(1, {
            x: 2,
            y: 2,
            direction: 1,
            from: 100
        });

        assert.isFalse(result);
        assert.equal(firstArrow, model.getActiveArrow(200, 2, 2).arrow);
    });

    it('should prevent placing arrows on top of other fixtures', function() {
        model.addArrow(0, {
            x: model.level.sinks[0].x,
            y: model.level.sinks[0].y,
            direction: 0,
            from: 0
        });

        model.addArrow(0, {
            x: model.level.sources[0].x,
            y: model.level.sources[0].y,
            direction: 0,
            from: 0
        });

        assert.isUndefined(model.getActiveArrow(0, model.level.sinks[0].x, model.level.sinks[0].y).arrow, 0);
        assert.isUndefined(model.getActiveArrow(0, model.level.sources[0].x, model.level.sources[0].y).arrow, 0);
    });

    it('should prevent the same player from placing more than three arrows', function() {
        var firstArrow = placeArrows();
        assert.isFalse(firstArrow.isActive(5));
    });

    it('should return active arrow when an active arrow is placed over an inactive one', function() {
        placeArrows();

        model.addArrow(0, {
            x: 0,
            y: 0,
            direction: 4,
            from: 4
        });

        var result = model.getActiveArrow(5, 0, 0);
        assert.isNotNull(result);
    });

    function placeArrows() {
        var firstArrow = model.addArrow(0, {
            x: 0,
            y: 0,
            direction: 0,
            from: 0
        });

        model.addArrow(0, {
            x: 1,
            y: 1,
            direction: 1,
            from: 1
        });

        model.addArrow(0, {
            x: 2,
            y: 2,
            direction: 2,
            from: 2
        });

        model.addArrow(0, {
            x: 3,
            y: 3,
            direction: 3,
            from: 3
        });

        return firstArrow;
    }
});