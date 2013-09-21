'use strict';

var TICK_INTERVAL = module.exports.TICK_INTERVAL = 100;

var gridUtils = require('./utils/grid.js');
var arrayUtils = require('./utils/array.js');
var spawning = require('./spawning.js');
var sprites = require('./sprites.js');

var MAX_ARROWS = 3;
var ARROW_LIFETIME = 10000;

module.exports.build = function build(gameData) {
    return new Model(gameData);
};

function Model(gameData) {
    this.playerArrows = arrayUtils.initialise(gameData.totalPlayers, function() { return []; });
    this.playerScores = arrayUtils.initialise(gameData.totalPlayers, 0);
    this.scoreHistory = [];
    this.spawningStrategy = gameData.initialSpawning || spawning.standard();
    this.critters = [];
    this.lastUpdate = 0;
    this.width = gameData.level.width;
    this.height = gameData.level.height;
    this.sources = gameData.level.sources;
    this.sinks = gameData.level.sinks;
    this.playerId = gameData.playerId;
    this.isRunning = true;

    this.update = function updateModel(gameTime) {
        if (gameTime >= gameData.totalTime) {
            this.isRunning = false;
            gameTime = gameData.totalTime;
        }

        if (Math.floor(gameTime / TICK_INTERVAL) > Math.floor(this.lastUpdate / TICK_INTERVAL)) {
            var nextTick = this.lastUpdate + TICK_INTERVAL - (this.lastUpdate % TICK_INTERVAL);
            for (var time = nextTick; time <= gameTime; time += TICK_INTERVAL) {
                updateCritters(this, time);
                this.spawningStrategy.rabbits(this, time, gameData.random);
                this.spawningStrategy.foxes(this, time, gameData.random);
                this.scoreHistory[time / TICK_INTERVAL] = this.playerScores.concat();
            }

            this.lastUpdate = gameTime;
        }
    };
}

Model.prototype.isArrowActive = function isArrowActive(arrow, gameTime) {
    gameTime = gameTime || this.lastUpdate;
    return arrow.from <= gameTime && (!arrow.to || arrow.to > gameTime);
};

Model.prototype.addArrow = function addArrow(player, newArrow) {
    if (gridUtils.getAtCell(this.sinks, newArrow.x, newArrow.y) ||
        gridUtils.getAtCell(this.sources, newArrow.x, newArrow.y)) {
        return;
    }

    var existing = this.getActiveArrow(null, newArrow.x, newArrow.y);
    if (existing.arrow) {
        if (newArrow.from <= existing.arrow.from) {
            // Remove the existing arrow that was pre-empted by another player
            var removedArrow = this.playerArrows[existing.player].splice(existing.index, 1)[0];

            // If the arrow we just removed replaced another arrow, re-instate it
            for (var j = this.playerArrows[existing.player].length - 1; j >= 0; --j) {
                var oldArrow = this.playerArrows[existing.player][j];
                if (oldArrow.to === removedArrow.from) {
                    delete oldArrow.to;
                    break;
                }
            }
        } else {
            return false;
        }
    }

    var ownArrows = this.playerArrows[player];
    var currentArrows = 0;
    for (var i = ownArrows.length - 1; i >= 0; --i) {
        if (this.isArrowActive(ownArrows[i], newArrow.from)) {
            if (++currentArrows === MAX_ARROWS) {
                ownArrows[i].to = newArrow.from;
                break;
            }
        }
    }

    newArrow.to = newArrow.from + ARROW_LIFETIME;
    ownArrows.push(newArrow);

    if (newArrow.from < this.lastUpdate) {
        restoreState(this, Math.floor(newArrow.from / TICK_INTERVAL));
    }

    return true;
};

Model.prototype.getActiveArrow = function getActiveArrow(time, x, y) {
    var haveMoreArrows = true;
    for (var i = 1; haveMoreArrows; ++i) {
        haveMoreArrows = false;
        for (var p = 0; p < this.playerArrows.length; ++p) {
            if (i <= this.playerArrows[p].length) {
                haveMoreArrows = true;
                var index = this.playerArrows[p].length - i;
                var arrow = this.playerArrows[p][index];
                if (arrow.x === x && arrow.y === y && this.isArrowActive(arrow, time)) {
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

Model.prototype.modifyScore = function modifyScore(player, modifier) {
    this.playerScores[player] = modifier(this.playerScores[player]);
};

function restoreState(model, tick) {
    model.playerScores = model.scoreHistory[tick];

    var remainingCritters = [];
    while (model.critters.length) {
        var critter = model.critters.pop();
        if (critter.firstTick <= tick) {
            critter.restore(tick);
            remainingCritters.push(critter);
        }
    }
    while (remainingCritters.length) {
        model.critters.push(remainingCritters.pop());
    }

    model.lastUpdate = tick * TICK_INTERVAL;
}

function updateCritters(model, gameTime) {
    model.critters.forEach(function(critter) {
        if (critter.inPlay) {
            critter.update(model, gameTime);
        }
    });
    sprites.performInteractions(model.critters);
}