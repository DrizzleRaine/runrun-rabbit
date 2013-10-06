'use strict';

var log = require('loglevel');
var util = require('util');

module.exports.RABBIT = {
    name: 'rabbit',
    speed: 0.0024,
    score: function(currentScore) {
        if (!this.isAlive) {
            return currentScore;
        }

        return currentScore + 1;
    }
};

module.exports.FOX = {
    name: 'fox',
    speed: 0.0022,
    score: function(currentScore) {
        return Math.floor(currentScore * 2 / 3);
    }
};

var gridUtils = require('./utils/grid.js');
var directionUtils = require('./utils/direction.js');
var TICK_INTERVAL = require('./model.js').TICK_INTERVAL;
var id = 0;

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

    this.firstTick = gameTime / TICK_INTERVAL;

    this.history[0] = {
        x: this.x,
        y: this.y,
        direction: source.direction,
        isAlive: this.isAlive
    };

    this.id = ++id;

    log.debug(util.format('%d: Creating critter %d of type %s at %d,%d', gameTime, this.id, this.type.name, this.x, this.y));
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

        var sink = gridUtils.getAtCell(model.level.sinks, centreX, centreY);
        if (sink !== null) {
            log.debug(util.format('%d: Critter %d of type %s entering sink at %d,%d', gameTime, this.id, this.type.name, centreX, centreY));
            this.inPlay = false;
            if (sink.player !== null) {
                model.playerScores.modify(sink.player, this.type.score.bind(this));
                log.debug(util.format('%d: Scores changes to %s', gameTime, model.playerScores.current.toString()));
            }
        } else {
            var timeToCentre = (Math.abs(this.x - centreX) + Math.abs(this.y - centreY)) / this.type.speed;
            var arrow = model.getActiveArrow(this.lastUpdate + timeToCentre, centreX, centreY).arrow;
            var newDirection = this.direction;
            if (arrow && (arrow.direction !== this.direction)) {
                newDirection = arrow.direction;
                if (this.type === module.exports.FOX && (this.direction % 2 === arrow.direction % 2)) {
                    arrow.hits.push(gameTime);
                }
            } else {
                var source = gridUtils.getAtCell(model.level.sources, centreX, centreY);
                if (source) {
                    newDirection = source.direction;
                }
            }

            newDirection = directionUtils.getNatural(newDirection, model, centreX, centreY);
            if (newDirection !== this.direction) {
                log.debug(util.format('%d: Critter %d of type %s changing direction from %d to %d, at %d,%d', gameTime, this.id, this.type.name, this.direction, newDirection, this.x.toFixed(3), this.y.toFixed(3)));
                this.direction = newDirection;

                var deltaD = Math.abs(deltaT * this.type.speed) - Math.abs(this.x - centreX) - Math.abs(this.y - centreY);
                var newDirectionVector = directionUtils.components(newDirection);
                newX = centreX + deltaD * newDirectionVector.x;
                newY = centreY + deltaD * newDirectionVector.y;
            }
        }
    }

    if (this.inPlay) {
        if (newX < 0 || newY < 0 || newX > model.width - 1 || newY > model.height - 1) {
            log.warn(util.format('%d: Critter %d out-of-bounds at %d,%d', gameTime, this.id, newX.toFixed(3), newY.toFixed(3)));
        }

        this.x = newX;
        this.y = newY;
        this.history[(gameTime / TICK_INTERVAL) - this.firstTick] = {
            x: this.x,
            y: this.y,
            direction: this.direction,
            isAlive: this.isAlive
        };
    }

    this.lastUpdate = gameTime;
};

Critter.prototype.restore = function restore(tick) {
    var relativeTick = tick - this.firstTick;
    this.inPlay = !!this.history[relativeTick];
    if (this.inPlay) {
        this.x = this.history[relativeTick].x;
        this.y = this.history[relativeTick].y;
        this.direction = this.history[relativeTick].direction;
        this.lastUpdate = tick * TICK_INTERVAL;
        this.isAlive = this.history[relativeTick].isAlive;
    }
};

module.exports.performInteractions = function(critters) {
    var activeFoxes = [];
    var activeRabbits = [];

    critters.forEach(function(critter) {
        if (critter.inPlay) {
            if (critter.type === module.exports.FOX) {
                activeFoxes.push(critter);
            } else {
                activeRabbits.push(critter);
            }
        }
    });

    activeFoxes.forEach(function(fox) {
        activeRabbits.forEach(function(rabbit) {
            var dx = fox.x - rabbit.x;
            var dy = fox.y - rabbit.y;
            if (dx * dx + dy * dy < 0.05) {
                log.trace(util.format('Fox at %d,%d killing rabbit at %d,%d', fox.x.toFixed(3), fox.y.toFixed(3), rabbit.x.toFixed(3), rabbit.y.toFixed(3)));
                rabbit.isAlive = false;
            }
        });
    });
};

module.exports.Critter = Critter;