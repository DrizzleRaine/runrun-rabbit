'use strict';

var sprites = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/sprites.js');
var assert = require('chai').assert;

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
});