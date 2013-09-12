/**
 * Adapted from: https://github.com/skeeto/rng-js (v1.0.0)
 * Seedable random number generator functions, to allow co-ordination between pseudo-random
 * systems running on multiple nodes.
 */
'use strict';

var DEFAULT_SEED_LENGTH = 16;

/**
 * Generates a seed using the built-in Math.random,
 * useful when you don't need consistency between nodes
 * @returns {Array}
 */
function seedFromSystemRandom() {
    var seed = [];
    for (var i = 0; i < DEFAULT_SEED_LENGTH; ++i) {
        seed.push(Math.floor(Math.random() * 256));
    }
    return seed;
}

/**
 * @param {Array} seed A byte array to seed the generator.
 * @constructor
 */
function RC4(seed) {
    this.s = new Array(256);
    this.i = 0;
    this.j = 0;
    for (var i = 0; i < 256; i++) {
        this.s[i] = i;
    }
    if (!seed) {
        seed = seedFromSystemRandom();
    }
    this.mix(seed);
}

RC4.prototype._swap = function(i, j) {
    var tmp = this.s[i];
    this.s[i] = this.s[j];
    this.s[j] = tmp;
};

/**
 * Mix additional entropy into this generator.
 * @param {Array} seed
 */
RC4.prototype.mix = function(seed) {
    var j = 0;
    for (var i = 0; i < this.s.length; i++) {
        j += this.s[i] + seed[i % seed.length];
        j %= 256;
        this._swap(i, j);
    }
};

/**
 * @returns {number} The next byte of output from the generator.
 */
RC4.prototype.nextByte = function() {
    this.i = (this.i + 1) % 256;
    this.j = (this.j + this.s[this.i]) % 256;
    this._swap(this.i, this.j);
    return this.s[(this.s[this.i] + this.s[this.j]) % 256];
};

/**
 * Spawns another generator from this one. This isn't a naive attempt to make things 'more random',
 * but a way to make it easier to ensure random number generators are called in a consistent order
 */
RC4.prototype.spawn = function() {
    var seed = [];
    for (var i = 0; i < DEFAULT_SEED_LENGTH; ++i) {
        seed.push(this.nextByte());
    }
    return new RC4(seed);
};

module.exports.RNG = RC4;