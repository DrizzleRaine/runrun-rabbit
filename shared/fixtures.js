'use strict';

var Source = function Source(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.lastUpdate = 0;
};

var Sink = function Sink(p, x, y) {
    return {
        player: p,
        x: x,
        y: y
    };
};

var TICK = 100;

var sprites = require('./sprites.js');

Source.prototype.update = function updateSource(model, gameTime) {
    if (gameTime > TICK) {
        if (Math.floor(gameTime / TICK) > Math.floor(this.lastUpdate / TICK)) {
            var rand = model.random.normal();
            if (rand > 2.5) {
                model.critters.push(new sprites.Critter(
                    this, sprites.FOX, gameTime - (gameTime % TICK)));
            } else if (rand > 1) {
                model.critters.push(new sprites.Critter(
                    this, sprites.RABBIT, gameTime - (gameTime % TICK)));
            }
        }
    }

    this.lastUpdate = gameTime;
};

module.exports.Source = Source;
module.exports.Sink = Sink;