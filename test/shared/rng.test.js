'use strict';

var rng = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/utils/rng.js');
var crypto = require('crypto');
var assert = require('chai').assert;

describe('rng', function() {
    it('should return the same values for the same seed', function() {
        var seed = crypto.pseudoRandomBytes(16);

        var rng1 = new rng.RNG(seed);
        var rng2 = new rng.RNG(crypto.pseudoRandomBytes(16));
        var rng3 = new rng.RNG(seed);

        var results1 = [];
        var results2 = [];
        var results3 = [];

        for (var i = 0; i < 10; ++i) {
            results1.push(rng1.nextByte());
            results2.push(rng2.nextByte());
            results3.push(rng3.nextByte());
        }

        assert.deepEqual(results1, results3);
        assert.notDeepEqual(results1, results2);
    });

    it('should return different values each time when given no seed', function() {
        var rng1 = new rng.RNG();
        var rng2 = new rng.RNG();

        var results1 = [];
        var results2 = [];

        for (var i = 0; i < 10; ++i) {
            results1.push(rng1.nextByte());
            results2.push(rng2.nextByte());
        }

        assert.notDeepEqual(results1, results2);
    });
});