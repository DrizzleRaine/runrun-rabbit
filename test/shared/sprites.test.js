'use strict';

var sprites = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/sprites.js');
var assert = require('chai').assert;
var sinon = require('sinon');

describe('sprites', function() {
    describe('MAX_TICK', function() {
        it('should not allow any sprite to skip over a whole cell', function() {
            for (var p in sprites) {
                if (sprites.hasOwnProperty(p) && sprites[p].hasOwnProperty('speed')) {
                    assert.isTrue(sprites.MAX_TICK * sprites[p].speed < 1);
                }
            }
        });
    });

    describe('update', function() {
        it('should check for arrows at the correct point in time', function() {
            var type = {
                speed: 0.01
            };

            var source = {
                x: 0,
                y: 0,
                direction: 1
            };

            var model = {
                sinks: [],
                getActiveArrow: sinon.stub(),
                width: 2,
                height: 2
            };

            model.getActiveArrow.returns({});

            var critter = new sprites.Critter(source, type, 0);
            critter.update(model, 100);

            assert(model.getActiveArrow.calledWith(50));
        });
    });
});