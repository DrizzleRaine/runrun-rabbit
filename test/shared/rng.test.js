'use strict';

var rng = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/utils/rng.js');
var assert = require('chai').assert;

describe('rng', function() {
    it('should return the same values for the same seed', function() {
        var seed1 = [ 28, 195, 114, 255, 164, 125, 53, 85, 84, 11, 44, 133, 138, 243, 250, 11 ];
        var seed2 = [ 67, 134, 29, 84, 205, 191, 171, 146, 183, 46, 204, 85, 165, 66, 93, 97 ];

        var rng1 = new rng.RNG(seed1);
        var rng2 = new rng.RNG(seed2);
        var rng3 = new rng.RNG(seed1);

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