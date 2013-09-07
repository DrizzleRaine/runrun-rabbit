'use strict';

var fixtures = require('./fixtures.js');

var levels = [];

function sink(p, x, y) {
    return {
        player: p,
        x: x,
        y: y
    };
}

function level(sources, sinks) {
    return {
        width: 12,
        height: 10,
        sources: sources,
        sinks: sinks
    };
}

levels[0] = level([new fixtures.Source(3, 0, 2), new fixtures.Source(8, 0, 2)],
    [sink(0, 3, 9), sink(1, 8, 9)]);

levels[1] = level([new fixtures.Source(0, 3, 1), new fixtures.Source(11, 6, 3)],
    [sink(0, 11, 3), sink(1, 0, 6), sink(null, 6, 0), sink(null, 5, 9)]);

module.exports = levels;