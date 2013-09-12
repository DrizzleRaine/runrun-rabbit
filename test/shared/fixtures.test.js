'use strict';

var fixtures = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/fixtures.js');
var sinon = require('sinon');
var assert = require('chai').assert;

describe('fixtures', function() {
    describe('source', function() {
        var dummyModel;
        var dummyRandom;
        var source;

        beforeEach(function() {
            dummyModel = {
                critters: []
            };

            dummyRandom = {
                nextByte: sinon.stub()
            };

            source = new fixtures.Source(0,0,0);
            source.init(dummyRandom);
        });

        it ('should create critters at predictable times', function() {
            dummyRandom.nextByte.returns(240);

            for (var gameTime = 50; gameTime < 500; gameTime += 100) {
                source.update(dummyModel, gameTime);
            }

            assert.equal(dummyModel.critters.length, 4);
            dummyModel.critters.forEach(function(critter) {
                assert.equal(critter.fromPoint.t % 100, 0);
            });
        });

        it ('should compensate for skipped updates', function() {
            dummyRandom.nextByte.returns(240);

            source.update(dummyModel, 450);

            assert.equal(dummyModel.critters.length, 4);
            dummyModel.critters.forEach(function(critter) {
                assert.equal(critter.fromPoint.t % 100, 0);
            });
        });

        it('should create when when update time falls exactly on a tick', function() {
            dummyRandom.nextByte.returns(240);

            source.update(dummyModel, 100);

            assert.equal(dummyModel.critters.length, 1);
            assert.equal(dummyModel.critters[0].fromPoint.t, 100);
        });
    });
});