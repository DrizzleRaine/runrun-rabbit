'use strict';

module.exports.RABBIT = {
    SPEED: 0.0024
};

module.exports.FOX = {
    SPEED: 0.0022
};

var gridUtils = require('./utils/grid.js');
var directionUtils = require('./utils/direction.js');

function Critter(source, type) {
    this.x = source.x;
    this.y = source.y;
    this.direction = source.direction;
    this.inPlay = true;
    this.type = type;

    var offset = directionUtils.components(source.direction);
    this.x += 0.5 * offset.x;
    this.y += 0.5 * offset.y;
}

Critter.prototype.update = function(model, deltaT) {
    var oldDirection = directionUtils.components(this.direction);

    var newX = this.x + (deltaT * this.type.SPEED * oldDirection.x);
    var newY = this.y + (deltaT * this.type.SPEED * oldDirection.y);

    var oldCellX = Math.floor(this.x);
    var oldCellY = Math.floor(this.y);

    var newCellX = Math.floor(newX);
    var newCellY = Math.floor(newY);

    if (newCellX !== oldCellX || newCellY !== oldCellY) {
        var centreX = Math.max(oldCellX, newCellX);
        var centreY = Math.max(oldCellY, newCellY);

        var sink = gridUtils.getAtCell(model.sinks, centreX, centreY);
        if (sink !== null) {
            this.inPlay = false;
            if (sink.player !== null) {
                model.rewardPlayer(sink.player, 1);
            }
        } else {
            var arrow = model.getArrow(centreX, centreY);
            var newDirection = this.direction;
            if (arrow && arrow.confirmed && (arrow.d !== this.direction)) {
                newDirection = arrow.d;
            }

            while (!directionUtils.isValid(directionUtils.components(newDirection), model, centreX, centreY)) {
                newDirection = (newDirection + 1) % 4;
            }

            if (newDirection !== oldDirection) {
                this.direction = newDirection;
                var deltaD = (deltaT * this.type.SPEED) - Math.abs(this.x - centreX) - Math.abs(this.y - centreY);
                var newComponents = directionUtils.components(newDirection);
                newX = centreX + deltaD * newComponents.x;
                newY = centreY + deltaD * newComponents.y;
            }
        }
    }

    this.x = newX;
    this.y = newY;
};

module.exports.Critter = Critter;