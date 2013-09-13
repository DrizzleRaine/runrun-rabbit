'use strict';

module.exports.MAX_TICK = 400;

module.exports.RABBIT = {
    speed: 0.0024,
    score: function(currentScore) {
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

function Critter(source, type, gameTime) {
    this.x = source.x;
    this.y = source.y;
    this.direction = source.direction;
    this.inPlay = true;
    this.type = type;

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

Critter.prototype.inRangeOf = function inRangeOf(arrow, deltaT) {
    var limit = this.type.speed * deltaT;
    var deltaX = this.x - arrow.x;
    var deltaY = this.y - arrow.y;
    return ((deltaX * deltaX) + (deltaY * deltaY)) < (limit * limit);
};


function updateInternal(model, gameTime) {
    /*jshint validthis:true */
    var deltaT = gameTime - this.lastUpdate;

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
                model.modifyScore(sink.player, this.type.score);
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
}

Critter.prototype.replay = function replay(model, gameTime) {
    this.x = this.fromPoint.x;
    this.y = this.fromPoint.y;
    this.direction = this.fromPoint.direction;
    this.lastUpdate = this.fromPoint.t;
    this.update(model, gameTime);
};

Critter.prototype.update = function(model, gameTime) {
    while (this.lastUpdate < gameTime) {
        updateInternal.call(this, model, Math.min(gameTime, this.lastUpdate + module.exports.MAX_TICK));
    }
};

module.exports.Critter = Critter;