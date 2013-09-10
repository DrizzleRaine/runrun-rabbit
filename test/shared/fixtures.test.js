'use strict';

var fixtures = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/fixtures.js');
var sinon = require('sinon');
var assert = require('chai').assert;

describe('fixtures', function() {
    describe('source', function() {
        var dummyModel;
        var source;

        beforeEach(function() {
            dummyModel = {
                random: {
                    normal: sinon.stub()
                },
                critters: []
            };

            source = new fixtures.Source(0,0,0);
        });

        it ('should create critters at predictable times', function() {
            dummyModel.random.normal.returns(2);

            for (var gameTime = 50; gameTime < 500; gameTime += 100) {
                source.update(dummyModel, gameTime);
            }

            assert.equal(dummyModel.critters.length, 4);
            dummyModel.critters.forEach(function(critter) {
                assert.equal(critter.fromPoint.t % 100, 0);
            });
        });

        it ('should compensate for skipped updates', function() {
            dummyModel.random.normal.returns(2);

            source.update(dummyModel, 450);

            assert.equal(dummyModel.critters.length, 4);
            dummyModel.critters.forEach(function(critter) {
                assert.equal(critter.fromPoint.t % 100, 0);
            });
        });
    });
});