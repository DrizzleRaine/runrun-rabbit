'use strict';

module.exports.RABBIT = {
    speed: 0.0024,
    score: function(currentScore) {
        if (!this.isAlive) {
            return currentScore;
        }

        return currentScore + 1;
    }
};

module.exports.FOX = {
    speed: 0.0022,
    score: function(currentScore) {
        return Math.ceil(currentScore / 2);
    }
};

var gridUtils = require('./utils/grid.js');
var directionUtils = require('./utils/direction.js');
var TICK_INTERVAL = require('./model.js').TICK_INTERVAL;

function Critter(source, type, gameTime) {
    this.x = source.x;
    this.y = source.y;
    this.direction = source.direction;
    this.isAlive = true;
    this.inPlay = true;
    this.type = type;

    this.history = [];

    var offset = directionUtils.components(source.direction);
    this.x += 0.5 * offset.x;
    this.y += 0.5 * offset.y;

    this.lastUpdate = gameTime;
    this.fromPoint = {
        x: this.x,
        y: this.y,
        t: gameTime,
        direction: source.direction
    };
}

Critter.prototype.update = function(model, gameTime) {
    /*jshint validthis:true */
    var deltaT = gameTime - this.lastUpdate;

    if (!this.isAlive) {
        return;
    }

    var directionVector = directionUtils.components(this.direction);

    var newX = this.x + (deltaT * this.type.speed * directionVector.x);
    var newY = this.y + (deltaT * this.type.speed * directionVector.y);

    var oldCellX = Math.floor(this.x);
    var oldCellY = Math.floor(this.y);

    var newCellX = Math.floor(newX);
    var newCellY = Math.floor(newY);

    if (newCellX !== oldCellX || newCellY !== oldCellY) {
        // Changing this from Math.max(oldCellX, newCellX) fixes a *consistently reproducible*
        // bug on the server side, due to Math.max(0, -1) apparently returning -1...
        var centreX = oldCellX > newCellX ? oldCellX : newCellX;
        var centreY = oldCellY > newCellY ? oldCellY : newCellY;

        var sink = gridUtils.getAtCell(model.sinks, centreX, centreY);
        if (sink !== null) {
            this.inPlay = false;
            if (sink.player !== null) {
                model.modifyScore(sink.player, this.type.score.bind(this));
            }
        } else {
            var timeToCentre = (Math.abs(this.x - centreX) + Math.abs(this.y - centreY)) / this.type.speed;
            var arrow = model.getActiveArrow(this.lastUpdate + timeToCentre, centreX, centreY).arrow;
            var newDirection = this.direction;
            if (arrow && (arrow.direction !== this.direction)) {
                newDirection = arrow.direction;
            } else {
                var source = gridUtils.getAtCell(model.sources, centreX, centreY);
                if (source) {
                    newDirection = source.direction;
                }
            }

            var rotation = 0;
            while (!directionUtils.isValid(directionUtils.components(newDirection), model, centreX, centreY)) {
                newDirection = (newDirection + (++rotation)) % 4;
            }

            if (newDirection !== this.direction) {
                this.direction = newDirection;

                var deltaD = Math.abs(deltaT * this.type.speed) - Math.abs(this.x - centreX) - Math.abs(this.y - centreY);
                var newDirectionVector = directionUtils.components(newDirection);
                newX = centreX + deltaD * newDirectionVector.x;
                newY = centreY + deltaD * newDirectionVector.y;
            }
        }
    }

    this.x = newX;
    this.y = newY;
    this.lastUpdate = gameTime;
    this.history[gameTime / TICK_INTERVAL] = {
        x: this.x,
        y: this.y,
        direction: this.direction,
        isAlive: this.isAlive
    };
};

Critter.prototype.restore = function restore(tick) {
    this.x = this.history[tick].x;
    this.y = this.history[tick].y;
    this.direction = this.history[tick].direction;
    this.lastUpdate = tick * TICK_INTERVAL;
    this.isAlive = this.history[tick].isAlive;
};

module.exports.performInteractions = function(critters) {
    var foxes = [];
    var rabbits = [];

    critters.forEach(function(critter) {
        if (critter.type === module.exports.FOX) {
            foxes.push(critter);
        } else {
            rabbits.push(critter);
        }
    });

    foxes.forEach(function(fox) {
        rabbits.forEach(function(rabbit) {
            var dx = fox.x - rabbit.x;
            var dy = fox.y - rabbit.y;
            if (dx * dx + dy * dy < 0.05) {
                rabbit.isAlive = false;
            }
        });
    });
};

module.exports.Critter = Critter;