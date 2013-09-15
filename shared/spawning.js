'use strict';

var sprites = require('./sprites.js');

var none = function() {};

function standardRabbits(model, time, random) {
    model.sources.forEach(function(source) {
        if (random.nextByte() > 220) {
            model.critters.push(new sprites.Critter(source, sprites.RABBIT, time));
        }
    });
}

function standardFoxes(model, time, random) {
    var foxCount = 0;
    model.critters.forEach(function(critter) {
        if (critter.type === sprites.FOX) {
            ++foxCount;
        }
    });
    if (foxCount === 0 && random.nextByte() > 127) {
        var foxSource = model.sources[random.nextByte() % model.sources.length];
        model.critters.push(new sprites.Critter(foxSource, sprites.FOX, time));
    }
}

module.exports.standard = {
    rabbits: standardRabbits,
    foxes: standardFoxes
};

module.exports.rabbitsOnly = {
    rabbits: standardRabbits,
    foxes: none
};

module.exports.foxesOnly = {
    rabbits: none,
    foxes: standardFoxes
};