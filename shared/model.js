'use strict';

var HORIZON = exports.HORIZON = 1000; // How far back in the past we'll go to compensate for lag

exports.build = function build(gameData) {
    var model = {};

    var gridUtils = require('./utils/grid.js');
    var arrayUtils = require('./utils/array.js');

    var MAX_ARROWS = 3;
    var playerArrows = arrayUtils.initialise(gameData.totalPlayers, function() { return []; });
    var playerScores = arrayUtils.initialise(gameData.totalPlayers, 0);
    var playerTimes = arrayUtils.initialise(gameData.totalPlayers, 9999);
    var playerHuds = [];
    var critters = [];

    function isArrowActive(arrow, gameTime) {
        gameTime = gameTime || lastUpdate;
        return arrow.from <= gameTime && !arrow.to;
    }

    function addArrow(player, arrow) {
        if (gridUtils.getAtCell(gameData.level.sinks, arrow.x, arrow.y) ||
            gridUtils.getAtCell(gameData.level.sources, arrow.x, arrow.y)) {
            return;
        }

        var existingArrow = getActiveArrow(arrow.from, arrow.x, arrow.y);
        if (existingArrow) {
            return false;
        }

        var ownArrows = playerArrows[player];
        var currentArrows = 0;
        for (var i = ownArrows.length - 1; i >= 0; --i) {
            if (isArrowActive(ownArrows[i], arrow.from)) {
                if (++currentArrows === MAX_ARROWS) {
                    ownArrows[i].to = arrow.from;
                    break;
                }
            }
        }

        ownArrows.push(arrow);

        if (arrow.from < lastUpdate) {
            critters.forEach(function(critter) {
                if (critter.inRangeOf(arrow, lastUpdate - arrow.from)) {
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
                    var arrow = playerArrows[p][playerArrows[p].length - i];
                    if (arrow.x === x && arrow.y === y && isArrowActive(arrow, time)) {
                        return arrow;
                    }
                }
            }
        }

        return null;
    }

    function cancelArrow(player, arrow) {
        for (var i = 0; i < playerArrows[player].length; ++i) {
            if (playerArrows[player][i].x === arrow.x && playerArrows[player][i].y === arrow.y) {
                playerArrows[player].splice(i, 1);
                return true;
            }
        }
        return false;
    }

    function modifyScore(player, modifier) {
        playerScores[player] = modifier(playerScores[player]);
    }

    function completePlayerTurn(player) {
        if (currentPlayer === player) {
            currentPlayer = (++currentPlayer) % gameData.totalPlayers;
        }
    }

    function registerHud(hud, player) {
        hud.done(function() {
            completePlayerTurn(player);
        });
        playerHuds[player] = hud;
    }

    var lastUpdate = 0;
    var currentPlayer = 0;

    function update(gameTime) {
        var delta = gameTime - lastUpdate;
        lastUpdate = gameTime;

        if (delta > HORIZON) {
            throw new Error('Lagged out...');
        }

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

        playerHuds.forEach(function(hud, player) {
            hud.update({
                score: playerScores[player],
                time: playerTimes[player]
            });
        });
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
    model.cancelArrow = cancelArrow;
    model.getActiveArrow = getActiveArrow;
    model.modifyScore = modifyScore;
    model.random = gameData.random;
    model.isArrowActive = isArrowActive;

    return model;
};