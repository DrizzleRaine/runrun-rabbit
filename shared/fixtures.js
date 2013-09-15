'use strict';

var Source = function Source(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
};

var Sink = function Sink(p, x, y) {
    return {
        player: p,
        x: x,
        y: y
    };
};

module.exports.Source = Source;
module.exports.Sink = Sink;