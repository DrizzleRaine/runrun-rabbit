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
    this.totalPlayers = totalPlayers;
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
    return getArrowMatchingPredicate(this.data, x, y, function(arrow) {
        return arrow.isActive(time);
    });
};

function getArrowAfter(data, x, y, fromTime) {
    return getArrowMatchingPredicate(data, x, y, function(arrow) {
        return arrow.from > fromTime;
    });
}

function removePreEmptedArrow(data, preEmpted) {
    // Remove the existing arrow that was pre-empted by another player
    var removedArrow = data[preEmpted.player].splice(preEmpted.index, 1)[0];

    // If the arrow we just removed replaced another arrow, re-instate it
    for (var j = data[preEmpted.player].length - 1; j >= 0; --j) {
        var oldArrow = data[preEmpted.player][j];
        if (oldArrow.to === removedArrow.from) {
            delete oldArrow.to;

            // The arrow we restore may in turn pre-empt another arrow...
            var undone = getArrowAfter(data, oldArrow.x, oldArrow.y, oldArrow.from);

            if (undone.arrow) {
                removePreEmptedArrow(data, undone);
            }

            break;
        }
    }
}

PlayerArrows.prototype.addArrow = function addArrow(player, arrowData, currentTime) {
    // Nudge the from time st. arrows can never be placed by two players at identical times (makes other cases easier)
    while ((arrowData.from % this.totalPlayers) !== player) {
        ++arrowData.from;
    }

    var existing = this.getActiveArrow(arrowData.from, arrowData.x, arrowData.y);
    if (existing.arrow) {
        return false;
    }

    var competing = getArrowAfter(this.data, arrowData.x, arrowData.y, Math.min(currentTime, arrowData.from));
    if (competing.arrow && competing.arrow.to > arrowData.from) {
        if (arrowData.from < competing.arrow.from) {
            removePreEmptedArrow(this.data, competing);
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

function getArrowMatchingPredicate(data, x, y, predicate) {
    var haveMoreArrows = true;
    for (var i = 1; haveMoreArrows; ++i) {
        haveMoreArrows = false;
        for (var p = 0; p < data.length; ++p) {
            if (i <= data[p].length) {
                haveMoreArrows = true;
                var index = data[p].length - i;
                var arrow = data[p][index];
                if (arrow.x === x && arrow.y === y && predicate(arrow)) {
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
}