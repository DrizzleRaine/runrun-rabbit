'use strict';

var TICK_INTERVAL = module.exports.TICK_INTERVAL = 100;

var gridUtils = require('./utils/grid.js');
var spawning = require('./spawning.js');
var sprites = require('./sprites.js');
var arrows = require('./arrows.js');
var scores = require('./scores.js');
var log = require('loglevel');

module.exports.build = function build(gameData) {
    return new Model(gameData);
};

function Model(gameData) {
    log.setLevel(gameData.logLevel || 'warn');

    this.playerArrows = new arrows.PlayerArrows(gameData.totalPlayers);
    this.playerScores = new scores.PlayerScores(gameData.totalPlayers);
    this.lastUpdate = 0;
    this.spawningStrategy = gameData.initialSpawning || spawning.standard();
    this.critters = [];
    this.level = gameData.level;
    this.playerId = gameData.playerId;
    this.totalPlayers = gameData.totalPlayers;
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
                this.playerScores.save(time / TICK_INTERVAL);
            }

            this.lastUpdate = gameTime;
        }
    };
}

Model.prototype.addArrow = function addArrow(player, arrowData) {
    if (!('from' in arrowData)) {
        arrowData.from = this.lastUpdate + TICK_INTERVAL;
    }

    if (gridUtils.getAtCell(this.level.sinks, arrowData.x, arrowData.y) ||
        gridUtils.getAtCell(this.level.sources, arrowData.x, arrowData.y)) {
        return false;
    }

    var addedArrow = this.playerArrows.addArrow(player, arrowData, this.lastUpdate);

    if (addedArrow && arrowData.from <= this.lastUpdate) {
        restoreState(this, Math.max(0, Math.floor((arrowData.from - 1) / TICK_INTERVAL)));
    }

    return addedArrow;
};

Model.prototype.getActiveArrow = function getActiveArrow(time, x, y) {
    return this.playerArrows.getActiveArrow(time, x, y);
};

function restoreState(model, tick) {
    model.playerScores.restore(tick);

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