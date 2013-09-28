'use strict';

var sprites = require('./sprites.js');
var TICK_INTERVAL = require('./model.js').TICK_INTERVAL;

var none = function() {};

function standardRabbits(model, random) {
    var results = [];

    model.level.sources.forEach(function(source, index) {
        if (random.nextByte() > 220) {
            results.push({
                sourceId: index,
                type: sprites.RABBIT
            });
        }
    });

    return results;
}

function foxFilter(model) {
    var foxCount = 0;
    model.critters.forEach(function(critter) {
        if (critter.type === sprites.FOX && critter.inPlay) {
            ++foxCount;
        }
    });
    return foxCount === 0;
}

function standardFoxes(model, random) {
    if (random.nextByte() > 127) {
        return [{
            sourceId: random.nextByte() % model.level.sources.length,
            type: sprites.FOX
        }];
    } else {
        return [];
    }
}

function cached(strategy, filter) {
    var history = [];

    return function(model, time, random) {
        var index = time / TICK_INTERVAL;
        var spawns = history[index];

        if (!spawns) {
            spawns = strategy(model, random);
            history[index] = spawns;
        }

        if (filter && !filter(model)) {
            return;
        }

        spawns.forEach(function (spawn) {
            model.critters.push(new sprites.Critter(model.level.sources[spawn.sourceId], spawn.type, time));
        });
    };
}

module.exports.standard = function () {
    return {
        rabbits: cached(standardRabbits),
        foxes: cached(standardFoxes, foxFilter)
    };
};

module.exports.rabbitsOnly = function() {
    return {
        rabbits: cached(standardRabbits),
        foxes: none
    };
};

module.exports.foxesOnly = function() {
    return {
        rabbits: none,
        foxes: cached(standardFoxes, foxFilter)
    };
};