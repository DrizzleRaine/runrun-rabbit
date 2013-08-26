var levels = [];

function source(x, y, d) {
    return {
        x: x,
        y: y,
        direction: d
    }
}

function sink(p, x, y) {
    return {
        player: p,
        x: x,
        y: y
    }
}

levels[0] = {
    sources: [source(3, 0, 2), source(8, 0, 2)],
    sinks: [sink(0, 3, 9), sink(1, 8, 9)]
};

levels[1] = {
    sources: [source(0, 3, 1), source(11, 6, 3)],
    sinks: [sink(0, 11, 3), sink(1, 0, 6), sink(null, 6, 0), sink(null, 5, 9)]
};

module.exports = levels;