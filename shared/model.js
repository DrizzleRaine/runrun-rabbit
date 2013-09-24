'use strict';

var TICK_INTERVAL = module.exports.TICK_INTERVAL = 100;

var gridUtils = require('./utils/grid.js');
var arrayUtils = require('./utils/array.js');
var spawning = require('./spawning.js');
var sprites = require('./sprites.js');
var arrows = require('./arrows.js');

module.exports.build = function build(gameData) {
    return new Model(gameData);
};

function Model(gameData) {
    this.playerArrows = new arrows.PlayerArrows(gameData.totalPlayers);
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

Model.prototype.addArrow = function addArrow(player, arrowData) {
    if (gridUtils.getAtCell(this.sinks, arrowData.x, arrowData.y) ||
        gridUtils.getAtCell(this.sources, arrowData.x, arrowData.y)) {
        return;
    }

    var addedArrow = this.playerArrows.addArrow(player, arrowData, this.lastUpdate);

    if (addedArrow && arrowData.from < this.lastUpdate) {
        restoreState(this, Math.floor(arrowData.from / TICK_INTERVAL));
    }

    return addedArrow;
};

Model.prototype.getActiveArrow = function getActiveArrow(time, x, y) {
    return this.playerArrows.getActiveArrow(time, x, y);
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

    model.playerArrows.restore(tick);

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