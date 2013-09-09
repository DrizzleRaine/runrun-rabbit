'use strict';

var modelFactory = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/model.js');
var sprites = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/sprites.js');
var sinon = require('sinon');
var assert = require('chai').assert;

describe('model', function() {
    var testLevel = {
        width: 5,
        height: 5,
        sources: [ { x: 0, y: 2, update: sinon.spy() } ],
        sinks: [ { x:4, y:2, player: null, update: sinon.spy() } ]
    };

    var model;
    var gameData;
    var gameTime;

    beforeEach(function() {
        gameData = {
            totalPlayers: 2,
            level: testLevel
        };

        model = modelFactory.build(gameData);
        gameTime = 0;
    });

    it('should prevent placing arrows on top of other arrows', function() {
        model.addArrow(0, {
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
        assert.equal(model.playerArrows[1].length, 0);
    });

    it('should prevent placing arrows on top of other fixtures', function() {
        model.addArrow(0, {
            x: model.sinks[0].x,
            y: model.sinks[0].y,
            direction: 0,
            from: 0
        });

        model.addArrow(0, {
            x: model.sources[0].x,
            y: model.sources[0].y,
            direction: 0,
            from: 0
        });

        assert.equal(model.playerArrows[0].length, 0);
    });

    it('should prevent the same player from placing more than three arrows', function() {
        placeArrows();
        assert.isFalse(model.isArrowActive(model.playerArrows[0][0], 5));
    });

    it('should alter critter direction based on arrows', function() {
        var critter = new sprites.Critter({
            x: 0,
            y: 2,
            direction: 1
        }, sprites.RABBIT, 0);

        model.critters.push(critter);

        var arrow = {
            x: 2,
            y: 2,
            direction: 0,
            from: gameTime
        };

        model.addArrow(0, arrow);

        while (critter.x < 2) {
            model.update(gameTime);
            gameTime += 100;
        }

        model.update(gameTime);

        assert.equal(critter.direction, arrow.direction,
            'arrow should have effected critter direction');
    });

    it('should compensate for arrows placed in the past', function() {
        var critter = new sprites.Critter({
            x: 0,
            y: 2,
            direction: 1
        }, sprites.RABBIT, 0);

        model.critters.push(critter);

        while (critter.x <= 2) {
            model.update(gameTime);
            gameTime += 100;
        }

        var arrow = {
            x: 2,
            y: 2,
            direction: 0,
            from: gameTime - 200
        };

        model.addArrow(0, arrow);

        assert.equal(critter.direction, arrow.direction,
            'arrow should have effected critter direction retroactively');
    });

    it('should compensate arrows removed/replaced due to overriding arrow', function() {
        var critter0 = new sprites.Critter({
            x: 0,
            y: 0,
            direction: 1
        }, sprites.RABBIT, 0);

        model.critters.push(critter0);

        var critter1 = new sprites.Critter({
            x: 0,
            y: 1,
            direction: 1
        }, sprites.RABBIT, 0);

        model.critters.push(critter1);

        model.addArrow(0, {
            x: 2,
            y: 0,
            direction: 2,
            from: 0
        });

        model.addArrow(0, {
            x: 2,
            y: 4,
            direction: 2,
            from: 0
        });

        model.addArrow(0, {
            x: 2,
            y: 3,
            direction: 2,
            from: 0
        });

        while (critter1.x + (critter1.type.speed * 100) <= 2) {
            model.update(gameTime);
            gameTime += 100;
        }

        model.addArrow(0, {
            x: 2,
            y: 1,
            direction: 2,
            from: gameTime - 100
        });

        model.update(gameTime);

        // This is just a check on our assumptions so far, not the purpose of this test
        // At this point, we'd expect the new arrow to take effect on critter1, and the oldest
        // arrow to become inactive, so not affect critter0
        assert.equal(critter1.direction, 2);
        assert.equal(critter0.direction, 1);

        // Now place an arrow from the other player, that pre-empts the last arrow placed above
        model.addArrow(1, {
            x: 2,
            y: 1,
            direction: 0,
            from: gameTime - 200
        });

        // Now, it's as if the arrow that affected critter0 had never been removed, and the arrow
        // that affected critter1 is the arrow placed by the other player.
        assert.equal(critter1.direction, 0);
        assert.equal(critter0.direction, 2);
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
        model.addArrow(0, {
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
    }
});