'use strict';

var modelFactory = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/model.js');
var sprites = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/sprites.js');
var fixtures = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/fixtures.js');
var spawning = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/spawning.js');
var sinon = require('sinon');
var assert = require('chai').assert;

describe('model', function() {
    var testLevel = {
        width: 5,
        height: 5,
        sources: [ new fixtures.Source(0, 2, 1) ],
        sinks: [ { x:4, y:2, player: null, update: sinon.spy() } ]
    };

    var model;
    var gameData;
    var gameTime;
    var dummyRandom;

    beforeEach(function() {
        dummyRandom = {
            nextByte: sinon.stub()
        };

        gameData = {
            totalPlayers: 2,
            level: testLevel,
            random: dummyRandom,
            initialSpawning: spawning.rabbitsOnly()
        };

        model = modelFactory.build(gameData);
        gameTime = 0;
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

        model.update(gameTime);

        assert.equal(critter.direction, arrow.direction,
            'arrow should have effected critter direction retroactively');
    });

    it('should preserve critter count when compensating for arrows placed in the past', function() {
        model.addArrow(0, {
            x: 3,
            y: 2,
            direction: 3,
            from: 0
        });

        while (gameTime < 2000) {
            dummyRandom.nextByte.returns(((gameTime / modelFactory.TICK_INTERVAL) % 2 ) * 255);
            model.update(gameTime);
            gameTime += 100;
        }

        model.update(gameTime);

        var expected = model.critters.length;

        model.addArrow(0, {
            x: 2,
            y: 0,
            direction: 2,
            from: 1000
        });

        // Double the spawn rate
        dummyRandom.nextByte.returns(255);

        model.update(gameTime);

        assert.equal(model.critters.length, expected, 'critter count should be preserved');
    });

    it('should restore critters when compensating for arrows placed in the past', function() {
        var critter = new sprites.Critter(model.sources[0], sprites.RABBIT, 0);

        model.critters.push(critter);

        while (critter.inPlay) {
            model.update(gameTime);
            gameTime += 100;
        }

        model.addArrow(0, {
            x: 3,
            y: 2,
            direction: 3,
            from: 200
        });

        model.update(gameTime);

        assert.isTrue(critter.inPlay, 'critter should be restored');
    });

    it('should compensate for critter interactions due to arrows placed in the past', function() {
        var rabbit1 = new sprites.Critter({
            x: 0,
            y: 0,
            direction: 1
        }, sprites.RABBIT, 0);

        var rabbit2 = new sprites.Critter({
            x: 4,
            y: 4,
            direction: 3
        }, sprites.RABBIT, 0);

        model.critters.push(rabbit1);
        model.critters.push(rabbit2);
        model.critters.push(new sprites.Critter({
            x: 2,
            y: 2,
            direction: 1
        }, sprites.FOX, 0));
        model.critters.push(new sprites.Critter({
            x: 2,
            y: 2,
            direction: 3
        }, sprites.FOX, 0));

        model.addArrow(0, {
            x: 2,
            y: 0,
            direction: 2,
            from: 0
        });

        model.addArrow(0, {
            x: 1,
            y: 2,
            direction: 1,
            from: 10
        });

        model.addArrow(0, {
            x: 3,
            y: 2,
            direction: 3,
            from: 20
        });

        while (rabbit1.isAlive) {
            model.update(gameTime);
            gameTime += 100;
        }

        console.log(gameTime);

        model.addArrow(0, {
            x: 2,
            y: 4,
            direction: 0,
            from: 100
        });

        model.update(gameTime);

        assert.isTrue(rabbit1.isAlive);
        assert.isFalse(rabbit2.isAlive);
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

        model.update(gameTime + 10);

        // Now, it's as if the arrow that affected critter0 had never been removed, and the arrow
        // that affected critter1 is the arrow placed by the other player.
        assert.equal(critter1.direction, 0);
        assert.equal(critter0.direction, 2);
    });

    it('should update correctly when updating is delayed', function() {
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
            from: 0
        };

        model.addArrow(0, arrow);
        model.update(3 / critter.type.speed);

        assert.equal(critter.direction, arrow.direction,
            'arrow should have effected critter direction');
    });

    describe('TICK_INTERVAL', function() {
        it('should not allow any sprite to skip over a whole cell', function() {
            for (var p in sprites) {
                if (sprites.hasOwnProperty(p) && sprites[p].hasOwnProperty('speed')) {
                    assert.isTrue(modelFactory.TICK_INTERVAL * sprites[p].speed < 1);
                }
            }
        });
    });

    describe('source', function() {
        it('should create critters at predictable times', function() {
            dummyRandom.nextByte.returns(240);

            for (var gameTime = 50; gameTime < 500; gameTime += 100) {
                model.update(gameTime);
            }

            assert.equal(model.critters.length, 4);
            model.critters.forEach(function(critter) {
                assert.equal(critter.firstTick, Math.floor(critter.firstTick));
            });
        });

        it('should compensate for skipped updates', function() {
            dummyRandom.nextByte.returns(240);

            model.update(450);

            assert.equal(model.critters.length, 4);
        });

        it('should create when update time falls exactly on a tick', function() {
            dummyRandom.nextByte.returns(240);

            model.update(100);

            assert.equal(model.critters.length, 1);
            assert.equal(model.critters[0].firstTick, 1);
        });
    });
});