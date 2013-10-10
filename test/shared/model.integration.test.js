'use strict';

var modelFactory = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/model.js');
var sprites = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/sprites.js');
var fixtures = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/fixtures.js');
var spawning = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/spawning.js');
var sinon = require('sinon');
var assert = require('chai').assert;

describe('model', function() {
    var testLevel;

    var model;
    var gameData;
    var gameTime;
    var dummyRandom;

    beforeEach(function() {
        testLevel = {
            width: 5,
            height: 5,
            sources: [ new fixtures.Source(0, 2, 1) ],
            sinks: [ { x:4, y:2, player: null, update: sinon.spy() } ]
        };

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

    function addArrow(player, x, y, direction, from) {
        return model.addArrow(player, {
            x: x,
            y: y,
            direction: direction,
            from: from || gameTime
        });
    }

    function spawnCritter(x, y, direction, type, from) {
        var critter = new sprites.Critter({
            x: x,
            y: y,
            direction: direction
        }, type || sprites.RABBIT, from || gameTime);

        model.critters.push(critter);

        return critter;
    }

    it('should alter critter direction based on arrows', function() {
        var critter = spawnCritter(0, 2, 1);
        var arrow = addArrow(0, 2, 2, 0);

        while (critter.x < 2) {
            model.update(gameTime);
            gameTime += 100;
        }
        model.update(gameTime);

        assert.equal(critter.direction, arrow.direction,
            'arrow should have effected critter direction');
    });

    it('should compensate for arrows placed in the past', function() {
        var critter = spawnCritter(0, 2, 1);

        while (critter.x <= 2) {
            model.update(gameTime);
            gameTime += 100;
        }
        var arrow = addArrow(0, 2, 2, 0, gameTime - 200);
        model.update(gameTime);

        assert.equal(critter.direction, arrow.direction,
            'arrow should have effected critter direction retroactively');
    });

    it('should preserve critter count when compensating for arrows placed in the past', function() {
        addArrow(0, 3, 2, 3);

        while (gameTime < 2000) {
            dummyRandom.nextByte.returns(((gameTime / modelFactory.TICK_INTERVAL) % 2 ) * 255);
            model.update(gameTime);
            gameTime += 100;
        }

        model.update(gameTime);

        var expected = model.critters.length;

        addArrow(0, 2, 0, 2, 1000);

        // Double the spawn rate - should have no effect during the time we're replaying
        dummyRandom.nextByte.returns(255);

        model.update(gameTime);

        assert.equal(model.critters.length, expected, 'critter count should be preserved');
    });

    it('should restore critters when compensating for arrows placed in the past', function() {
        var critter = spawnCritter(0, 2, 1);

        while (critter.inPlay) {
            model.update(gameTime);
            gameTime += 100;
        }

        addArrow(0, 3, 2, 3, 200, gameTime - 100);

        model.update(gameTime);

        assert.isTrue(critter.inPlay, 'critter should be restored');
    });

    it('should compensate for critter interactions due to arrows placed in the past', function() {
        var rabbit1 = spawnCritter(0, 0, 1);
        var rabbit2 = spawnCritter(4, 4, 3);
        spawnCritter(2, 2, 1, sprites.FOX);
        spawnCritter(2, 2, 3, sprites.FOX);
        addArrow(0, 2, 0, 2);
        addArrow(0, 4, 0, 2, 10);
        addArrow(0, 0, 4, 0, 10);
        // (Just using sources to trap the foxes - arrows are no good since foxes will destroy them)
        model.level.sources.push(new fixtures.Source(1, 2, 1));
        model.level.sources.push(new fixtures.Source(3, 2, 3));

        while (rabbit1.isAlive) {
            model.update(gameTime);
            gameTime += 100;
        }
        addArrow(0, 2, 4, 0, 100, gameTime - 100);
        model.update(gameTime);

        assert.isTrue(rabbit1.isAlive);
        assert.isFalse(rabbit2.isAlive);
    });

    it('should compensate arrows removed/replaced due to overriding arrow', function() {
        var critter0 = spawnCritter(0, 0, 1);
        var critter1 = spawnCritter(0, 1, 1);
        addArrow(0, 2, 0, 2);
        addArrow(0, 2, 4, 2);
        addArrow(0, 2, 3, 2);

        while (critter1.x + (critter1.type.speed * 100) <= 2) {
            model.update(gameTime);
            gameTime += 100;
        }

        addArrow(0, 2, 1, 2, gameTime - 100, gameTime - 100);

        model.update(gameTime);

        // This is just a check on our assumptions so far, not the purpose of this test
        // At this point, we'd expect the new arrow to take effect on critter1, and the oldest
        // arrow to become inactive, so not affect critter0
        assert.equal(critter1.direction, 2);
        assert.equal(critter0.direction, 1);

        // Now place an arrow from the other player, that pre-empts the last arrow placed above
        addArrow(1, 2, 1, 0, gameTime - 200);

        model.update(gameTime + 10);

        // Now, it's as if the arrow that affected critter0 had never been removed, and the arrow
        // that affected critter1 is the arrow placed by the other player.
        assert.equal(critter1.direction, 0);
        assert.equal(critter0.direction, 2);
    });

    it('should update correctly when updating is delayed', function() {
        var critter = spawnCritter(0, 2, 1);
        var arrow = addArrow(0, 2, 2, 0);
        model.update(3 / critter.type.speed);

        assert.equal(critter.direction, arrow.direction,
            'arrow should have effected critter direction');
    });

    it('should remove arrows after multiple head-on collisions with foxes', function() {
        var arrow = addArrow(0, 3, 2, 3);
        var fox = spawnCritter(0, 2, 1, sprites.FOX);

        arrow.to = Infinity;
        runForDirectionChanges(fox, 20);

        assert.isFalse(arrow.isActive(gameTime));
    });

    it('should not remove arrows after multiple side-on collisions with foxes', function() {
        var arrow = addArrow(0, 1, 2, 2);
        var fox = spawnCritter(0, 2, 1, sprites.FOX);

        arrow.to = Infinity;
        runForDirectionChanges(fox, 20);

        assert.isTrue(arrow.isActive(gameTime));
    });

    it('should not remove arrows after multiple collisions with rabbits', function() {
        var arrow = addArrow(0, 3, 2, 3);
        var rabbit = spawnCritter(0, 2, 1);

        arrow.to = Infinity;
        runForDirectionChanges(rabbit, 20);

        assert.isTrue(arrow.isActive(gameTime));
    });

    it('should not put critters back in play when restoring state to point that critter died', function() {
        var rabbit = spawnCritter(0, 2, 1);

        while (rabbit.inPlay) {
            model.update(gameTime);
            gameTime += 100;
        }

        var restoreTime = model.lastUpdate;
        model.update(gameTime);

        addArrow(0, 1, 1, 1, restoreTime + 50);

        assert.isFalse(rabbit.inPlay);
    });

    function runForDirectionChanges(critter, numberOfChanges) {
        var lastDirection = critter.direction;
        var directionChanges = 0;
        while (directionChanges < numberOfChanges && critter.inPlay) {
            if (lastDirection !== critter.direction) {
                ++directionChanges;
                lastDirection = critter.direction;
            }
            model.update(gameTime);
            gameTime += 100;
        }
    }

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

    describe('scores', function() {
        it('should restore consistently to previous time', function() {
            testLevel.sinks[0].player = 0;

            dummyRandom.nextByte.returns(240);

            while (model.playerScores.current[0] === 0) {
                model.update(gameTime);
                gameTime += 100;
            }

            addArrow(1, 0, 0, 1, gameTime - 150);
            assert.equal(0, model.playerScores.current[0]);

            model.update(gameTime - 100);
            model.update(gameTime);

            addArrow(1, 1, 1, 1, gameTime - 150);
            assert.equal(0, model.playerScores.current[0]);
        });
    });
});