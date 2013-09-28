'use strict';

//noinspection JSUnresolvedFunction
var arrayUtils = require('./utils/array.js');
var TICK_INTERVAL = require('./model.js').TICK_INTERVAL;
var ARROW_LIFETIME = module.exports.ARROW_LIFETIME = 10000;
var MAX_ARROWS = module.exports.MAX_ARROWS = 3;

var Arrow = module.exports.Arrow = function Arrow(x, y, direction, from) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.from = from;
    this.to = this.from + ARROW_LIFETIME;
    this.hits = [];
};

Arrow.prototype.isActive = function isArrowActive(gameTime) {
    return this.from <= gameTime && (!this.to || this.to > gameTime) && this.hits.length < 2;
};

var PlayerArrows = module.exports.PlayerArrows = function PlayerArrows(totalPlayers) {
    this.data = arrayUtils.initialise(totalPlayers, function() { return []; });
};

PlayerArrows.prototype.restore = function restoreArrows(tick) {
    var gameTime = tick * TICK_INTERVAL;
    this.forEach(function(arrow) {
        while (arrow.hits.length && arrow.hits[arrow.hits.length - 1] > gameTime) {
            arrow.hits.pop();
        }
    });
};

PlayerArrows.prototype.forEach = function forEachArrow(callback) {
    this.data.forEach(function(arrows, player) {
        arrows.forEach(function(arrow) {
            callback(arrow, player);
        });
    });
};

PlayerArrows.prototype.getActiveArrow = function getActiveArrow(time, x, y) {
    var haveMoreArrows = true;
    for (var i = 1; haveMoreArrows; ++i) {
        haveMoreArrows = false;
        for (var p = 0; p < this.data.length; ++p) {
            if (i <= this.data[p].length) {
                haveMoreArrows = true;
                var index = this.data[p].length - i;
                var arrow = this.data[p][index];
                if (arrow.x === x && arrow.y === y && arrow.isActive(time)) {
                    return {
                        arrow: arrow,
                        player: p,
                        index: index
                    };
                }
            }
        }
    }

    return {};
};

PlayerArrows.prototype.addArrow = function addArrow(player, arrowData, currentTime) {
    var existing = this.getActiveArrow(currentTime, arrowData.x, arrowData.y);
    if (existing.arrow) {
        if (arrowData.from <= existing.arrow.from) {
            // Remove the existing arrow that was pre-empted by another player
            var removedArrow = this.data[existing.player].splice(existing.index, 1)[0];

            // If the arrow we just removed replaced another arrow, re-instate it
            for (var j = this.data[existing.player].length - 1; j >= 0; --j) {
                var oldArrow = this.data[existing.player][j];
                if (oldArrow.to === removedArrow.from) {
                    delete oldArrow.to;
                    break;
                }
            }
        } else {
            return false;
        }
    }

    var ownArrows = this.data[player];
    var currentArrows = 0;
    for (var i = ownArrows.length - 1; i >= 0; --i) {
        if (ownArrows[i].isActive(arrowData.from)) {
            if (++currentArrows === MAX_ARROWS) {
                ownArrows[i].to = arrowData.from;
                break;
            }
        }
    }

    var newArrow = new Arrow(arrowData.x, arrowData.y, arrowData.direction, arrowData.from);
    ownArrows.push(newArrow);
    return newArrow;
};