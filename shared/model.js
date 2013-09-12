'use strict';

exports.build = function build(gameData) {
    var model = {};

    var gridUtils = require('./utils/grid.js');
    var arrayUtils = require('./utils/array.js');

    var MAX_ARROWS = 3;
    var playerArrows = arrayUtils.initialise(gameData.totalPlayers, function() { return []; });
    var playerScores = arrayUtils.initialise(gameData.totalPlayers, 0);
    var playerTimes = arrayUtils.initialise(gameData.totalPlayers, 9999);
    var hud;
    var critters = [];

    gameData.level.sources.forEach(function(source) {
        source.init(gameData.random.spawn());
    });

    function isArrowActive(arrow, gameTime) {
        gameTime = gameTime || lastUpdate;
        return arrow.from <= gameTime && (!arrow.to || arrow.to > gameTime);
    }

    function addArrow(player, newArrow) {
        if (gridUtils.getAtCell(gameData.level.sinks, newArrow.x, newArrow.y) ||
            gridUtils.getAtCell(gameData.level.sources, newArrow.x, newArrow.y)) {
            return;
        }

        var revisedArrows = [];
        var existing = getActiveArrow(null, newArrow.x, newArrow.y);
        if (existing.arrow) {
            if (newArrow.from <= existing.arrow.from) {
                // Remove the existing arrow that was pre-empted by another player
                revisedArrows = playerArrows[existing.player].splice(existing.index, 1);

                // If the arrow we just removed replaced another arrow, re-instate it
                for (var j = playerArrows[existing.player].length - 1; j >= 0; --j) {
                    var oldArrow = playerArrows[existing.player][j];
                    if (oldArrow.to === revisedArrows[0].from) {
                        delete oldArrow.to;
                        revisedArrows.push(oldArrow);
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

        ownArrows.push(newArrow);

        if (newArrow.from < lastUpdate) {
            revisedArrows.push(newArrow);
        }

        if (revisedArrows.length) {
            critters.forEach(function(critter) {
                var replay = false;
                for (var k = 0; k < revisedArrows.length; ++k) {
                    // It is correct that we use newArrow.from here, rather than revisedArrows[k].from
                    // There are actually only three possible arrows in this list:
                    // * The new arrow itself
                    // * An arrow it pre-empted, in which case revisedArrows[k].from.from > newArrow.from
                    //   anyway (by the definition of pre-empted), so we're just picking the larger range
                    // * An arrow we're re-instating due to removing the pre-empted arrow, which
                    //   could be quite old but we only care about recent interactions with it
                    if (critter.inRangeOf(revisedArrows[k], lastUpdate - newArrow.from)) {
                        replay = true;
                        break;
                    }
                }
                if (replay) {
                    critter.replay(model, lastUpdate);
                }
            });
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

    function completePlayerTurn(player) {
        if (currentPlayer === player) {
            currentPlayer = (++currentPlayer) % gameData.totalPlayers;
        }
    }

    function registerHud(newHud) {
        hud = newHud;
    }

    var lastUpdate = 0;
    var currentPlayer = 0;

    function update(gameTime) {
        if (gameTime >= gameData.totalTime) {
            model.isRunning = false;
            gameTime = gameData.totalTime;
        }

        var delta = gameTime - lastUpdate;
        lastUpdate = gameTime;

        playerTimes[currentPlayer] -= delta;

        if (playerTimes[currentPlayer] <= 0) {
            playerTimes[currentPlayer] = 0;
            completePlayerTurn(currentPlayer);
        }

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

        gameData.level.sources.forEach(function(source) {
            source.update(model, gameTime);
        });

        if (hud) {
            hud.update({
                score: playerScores,
                time: gameData.totalTime - gameTime
            });
        }
    }

    model.width = gameData.level.width;
    model.height = gameData.level.height;
    model.sources = gameData.level.sources;
    model.sinks = gameData.level.sinks;
    model.critters = critters;
    model.playerArrows = playerArrows;
    model.playerTimes = playerTimes;
    model.registerHud = registerHud;
    model.update = update;
    model.addArrow = addArrow;
    model.getActiveArrow = getActiveArrow;
    model.modifyScore = modifyScore;
    model.isArrowActive = isArrowActive;
    model.isRunning = true;

    return model;
};