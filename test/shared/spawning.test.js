'use strict';

var spawning = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/spawning.js');
var sprites = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/sprites.js');
var sinon = require('sinon');
var assert = require('chai').assert;

describe('spawning', function() {
    var random;
    var model;

    beforeEach(function() {
        random = {
            nextByte: new sinon.stub()
        };

        model = {
            critters: [],
            level: {
                sources: [{}, {}, {}]
            }
        };
    });

    describe('standard foxes', function() {
        it('should add foxes when none exist and dice roll high', function() {
            random.nextByte.returns(255);

            spawning.standard().foxes(model, 0, random);

            assert.equal(1, model.critters.length);
            assert.equal(sprites.FOX, model.critters[0].type);
        });

        it('should add foxes when none in play and dice roll high', function() {
            model.critters.push({
                type: sprites.FOX,
                inPlay: false
            });

            random.nextByte.returns(255);

            spawning.standard().foxes(model, 0, random);

            assert.equal(2, model.critters.length);
            assert.equal(sprites.FOX, model.critters[1].type);
        });

        it('should not add foxes when dice roll low', function() {
            random.nextByte.returns(0);

            spawning.standard().foxes(model, 0, random);

            assert.equal(0, model.critters.length);
        });

        it('should not add foxes if already present', function() {
            model.critters.push({
                type: sprites.FOX,
                inPlay: true
            });
            random.nextByte.returns(255);

            spawning.standard().foxes(model, 0, random);

            assert.equal(1, model.critters.length);
        });
    });
});