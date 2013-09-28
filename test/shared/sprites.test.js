'use strict';

var sprites = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/sprites.js');
var assert = require('chai').assert;
var sinon = require('sinon');

describe('sprites', function() {
    describe('update', function() {
        var type = {
            speed: 0.01
        };

        var source = {
            x: 0,
            y: 0,
            direction: 1
        };

        it('should check for arrows at the correct point in time', function() {
            var model = {
                level: {
                    sources: [],
                    sinks: [],
                    width: 2,
                    height: 2
                },
                getActiveArrow: sinon.stub()
            };

            model.getActiveArrow.returns({});

            var critter = new sprites.Critter(source, type, 0);
            critter.update(model, 100);

            assert(model.getActiveArrow.calledWith(50));
        });

        it('should turn right when reaching a wall', function() {
            var source = {
                x: 0,
                y: 1,
                direction: 1
            };

            var model = {
                level: {
                    sources: [],
                    sinks: [],
                    width: 3,
                    height: 3
                },
                getActiveArrow: sinon.stub()
            };

            model.getActiveArrow.returns({});

            var critter = new sprites.Critter(source, type, 0);
            critter.update(model, 100);
            critter.update(model, 200);

            assert.equal(2, critter.direction);
        });

        it('should turn left when reaching a corner with no right turn', function() {
            var source = {
                x: 0,
                y: 2,
                direction: 1
            };

            var model = {
                level: {
                    sources: [],
                    sinks: [],
                    width: 3,
                    height: 3
                },
                getActiveArrow: sinon.stub()
            };

            model.getActiveArrow.returns({});

            var critter = new sprites.Critter(source, type, 0);
            critter.update(model, 100);
            critter.update(model, 200);

            assert.equal(0, critter.direction);
        });

        it('should reverse direction when reaching a dead end', function() {
            var source = {
                x: 0,
                y: 0,
                direction: 1
            };

            var model = {
                level: {
                    sources: [],
                    sinks: [],
                    width: 3,
                    height: 1
                },
                getActiveArrow: sinon.stub()
            };

            model.getActiveArrow.returns({});

            var critter = new sprites.Critter(source, type, 0);
            critter.update(model, 100);
            critter.update(model, 200);

            assert.equal(3, critter.direction);
        });
    });

    describe('performInteractions', function() {
        it('should kill rabbits when colliding with foxes', function() {
            var critters = [
                { x: 1.49, y: 1.5, type: sprites.RABBIT, isAlive: true, inPlay: true },
                { x: 1.5, y: 1.51, type: sprites.FOX, isAlive: true, inPlay: true}
            ];

            sprites.performInteractions(critters);

            assert.isFalse(critters[0].isAlive);
        });

        it ('should not kill rabbits when colliding with foxes not in play', function() {
            var critters = [
                { x: 1.49, y: 1.5, type: sprites.RABBIT, isAlive: true, inPlay: true },
                { x: 1.5, y: 1.51, type: sprites.FOX, isAlive: true, inPlay: false}
            ];

            sprites.performInteractions(critters);

            assert.isTrue(critters[0].isAlive);
        });
    });
});