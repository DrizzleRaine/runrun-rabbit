'use strict';

var fixtures = require('./fixtures.js');

var Sink = fixtures.Sink, Source = fixtures.Source;

var levels = [];

function level(sources, sinks) {
    return {
        width: 12,
        height: 10,
        sources: sources,
        sinks: sinks
    };
}

levels[0] = level([new Source(3, 0, 2), new Source(8, 0, 2)],
    [new Sink(0, 3, 9), new Sink(1, 8, 9)]);

levels[1] = level([new Source(0, 3, 1), new Source(11, 6, 3)],
    [new Sink(0, 11, 3), new Sink(1, 0, 6), new Sink(null, 6, 0), new Sink(null, 5, 9)]);

module.exports = levels;