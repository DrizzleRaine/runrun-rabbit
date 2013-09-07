var Source = function Source(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.lastUpdate = 0;
};

var TICK = 100;

var sprites = require('./sprites.js');

Source.prototype.update = function updateSource(model, gameTime) {
    if (gameTime > TICK) {
        if (Math.floor(gameTime / TICK) > Math.floor(this.lastUpdate / TICK)) {
            var rand = model.random.normal();
            if (rand > 2.5) {
                model.critters.push(new sprites.Critter(this, sprites.FOX));
            } else if (rand > 1) {
                model.critters.push(new sprites.Critter(this, sprites.RABBIT));
            }
        }
    }

    this.lastUpdate = gameTime;
};

module.exports.Source = Source;