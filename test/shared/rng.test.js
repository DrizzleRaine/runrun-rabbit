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

        for (var i = 0; i < 10; ++i) {
            var sample = rng1.normal();
            
            assert.equal(sample, rng3.normal());
            assert.notEqual(sample, rng2.normal());
        }
    });

    it('should return different values each time when given no seed', function() {
        var rng1 = new rng.RNG();
        var rng2 = new rng.RNG();

        for (var i = 0; i < 10; ++i) {
            assert.notEqual(rng1.normal(), rng2.normal());
        }
    });
});