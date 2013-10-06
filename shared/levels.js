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

levels[0] = level([new Source(0, 3, 1), new Source(11, 6, 3)],
    [new Sink(0, 11, 3), new Sink(1, 0, 6), new Sink(null, 6, 0), new Sink(null, 5, 9)]);

levels[1] = level(
    [new Source(5, 0, 2), new Source(6, 9, 0), new Source(6, 0, 2), new Source(5, 9, 0)],
    [new Sink(0, 1, 0), new Sink(0, 0, 1), new Sink(null, 2, 0), new Sink(null, 0, 2),
        new Sink(1, 11, 8), new Sink(1, 10, 9), new Sink(null, 11, 7), new Sink(null, 9, 9)]);

levels[2] = level([new Source(0, 8, 1), new Source(11, 9, 3)],
    [new Sink(null, 0, 7), new Sink(null, 0, 0), new Sink(null, 11, 0),
        new Sink(0, 2, 0), new Sink(1, 4, 0), new Sink(0, 7, 0), new Sink(1, 9, 0)]);

levels[3] = level([new Source(5, 3, 0), new Source(6, 3, 1), new Source (6, 6, 2), new Source(5, 6, 3)],
    [new Sink(0, 2, 2), new Sink(1, 9, 2), new Sink(0, 9, 7), new Sink(1, 2, 7)]);

module.exports = levels;