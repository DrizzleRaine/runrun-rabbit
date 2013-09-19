'use strict';

var TICK_INTERVAL = module.exports.TICK_INTERVAL = 100;

module.exports.build = function build(gameData) {
    var model = {};

    var gridUtils = require('./utils/grid.js');
    var arrayUtils = require('./utils/array.js');
    var spawning = require('./spawning.js');
    var sprites = require('./sprites.js');

    var MAX_ARROWS = 3;
    var playerArrows = arrayUtils.initialise(gameData.totalPlayers, function() { return []; });
    var playerScores = arrayUtils.initialise(gameData.totalPlayers, 0);
    var scoreHistory = [];

    var spawningStrategy = gameData.initialSpawning || spawning.standard;

    var critters = [];
    var ais = [];

    function isArrowActive(arrow, gameTime) {
        gameTime = gameTime || lastUpdate;
        return arrow.from <= gameTime && (!arrow.to || arrow.to > gameTime);
    }

    function restoreState(tick) {
        model.playerScores = scoreHistory[tick];
        model.critters.forEach(function(critter) {
            critter.restore(tick);
        });
        lastUpdate = tick * TICK_INTERVAL;
    }

    function addArrow(player, newArrow) {
        if (gridUtils.getAtCell(gameData.level.sinks, newArrow.x, newArrow.y) ||
            gridUtils.getAtCell(gameData.level.sources, newArrow.x, newArrow.y)) {
            return;
        }

        var existing = getActiveArrow(null, newArrow.x, newArrow.y);
        if (existing.arrow) {
            if (newArrow.from <= existing.arrow.from) {
                // Remove the existing arrow that was pre-empted by another player
                var removedArrow = playerArrows[existing.player].splice(existing.index, 1)[0];

                // If the arrow we just removed replaced another arrow, re-instate it
                for (var j = playerArrows[existing.player].length - 1; j >= 0; --j) {
                    var oldArrow = playerArrows[existing.player][j];
                    if (oldArrow.to === removedArrow.from) {
                        delete oldArrow.to;
                        break;
                    }
                }
            } else {
                return false;
            }
        }

        var ownArrows = playerArrows[player];
        var currentArrows = 0;
        for (var i = ownArrows.length - 1; i >= 0; --i) {
            if (isArrowActive(ownArrows[i], newArrow.from)) {
                if (++currentArrows === MAX_ARROWS) {
                    ownArrows[i].to = newArrow.from;
                    break;
                }
            }
        }

        newArrow.to = newArrow.from + 10000;
        ownArrows.push(newArrow);

        if (newArrow.from < lastUpdate) {
            restoreState(Math.floor(newArrow.from / TICK_INTERVAL));
        }

        return true;
    }

    function getActiveArrow(time, x, y) {
        var haveMoreArrows = true;
        for (var i = 1; haveMoreArrows; ++i) {
            haveMoreArrows = false;
            for (var p = 0; p < playerArrows.length; ++p) {
                if (i <= playerArrows[p].length) {
                    haveMoreArrows = true;
                    var index = playerArrows[p].length - i;
                    var arrow = playerArrows[p][index];
                    if (arrow.x === x && arrow.y === y && isArrowActive(arrow, time)) {
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

    function modifyScore(player, modifier) {
        playerScores[player] = modifier(playerScores[player]);
    }

    function updateCritters(gameTime) {
        var remainingCritters = [];
        while (critters.length) {
            var critter = critters.pop();
            critter.update(model, gameTime);
            if (critter.inPlay) {
                remainingCritters.push(critter);
            }
        }
        while (remainingCritters.length) {
            critters.push(remainingCritters.pop());
        }
        sprites.performInteractions(critters);
    }

    var lastUpdate = 0;

    function updateAis(gameTime) {
        ais.forEach(function(ai) {
            ai.update(model, gameTime);
        });
    }

    function update(gameTime) {
        if (gameTime >= gameData.totalTime) {
            model.isRunning = false;
            gameTime = gameData.totalTime;
        }

        if (Math.floor(gameTime / TICK_INTERVAL) > Math.floor(lastUpdate / TICK_INTERVAL)) {
            for (var time = lastUpdate + TICK_INTERVAL - (lastUpdate % TICK_INTERVAL); time <= gameTime; time += TICK_INTERVAL) {
                updateCritters(time);
                spawningStrategy.rabbits(model, time, gameData.random);
                spawningStrategy.foxes(model, time, gameData.random);
                updateAis(time);

                scoreHistory[time / TICK_INTERVAL] = model.playerScores.concat();
            }

            lastUpdate = gameTime;
        }
    }

    function addAi(ai) {
        ais.push(ai);
    }

    model.width = gameData.level.width;
    model.height = gameData.level.height;
    model.sources = gameData.level.sources;
    model.sinks = gameData.level.sinks;
    model.critters = critters;
    model.playerId = gameData.playerId;
    model.playerArrows = playerArrows;
    model.playerScores = playerScores;
    model.update = update;
    model.addArrow = addArrow;
    model.getActiveArrow = getActiveArrow;
    model.modifyScore = modifyScore;
    model.isArrowActive = isArrowActive;
    model.isRunning = true;
    model.addAi = addAi;

    return model;
};