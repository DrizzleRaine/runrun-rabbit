'use strict';

exports.build = function build(gameData) {
    var model = {};

    var gridUtils = require('./utils/grid.js');
    var arrayUtils = require('./utils/array.js');
    var sprites = require('./sprites.js');
    var level = require('./levels.js')[gameData.levelId];
//    var RNG = require('./utils/rng.js').RNG;
//    var random = new RNG(gameData.seed);

    var MAX_ARROWS = 3;
    var playerArrows = arrayUtils.initialise(gameData.totalPlayers, function() { return []; });
    var playerScores = arrayUtils.initialise(gameData.totalPlayers, 0);
    var playerTimes = arrayUtils.initialise(gameData.totalPlayers, 9999);
    var playerHuds = [];

    function addArrow(player, arrow) {
        var existingArrow = getArrow(arrow.x, arrow.y);
        if (existingArrow) {
            if (arrow.confirmed && !existingArrow.confirmed) {
                existingArrow.confirmed = true;
                return true;
            } else {
                return false;
            }
        }

        var ownArrows = playerArrows[player];
        if (ownArrows.length === MAX_ARROWS) {
            ownArrows.shift();
        }

        ownArrows.push(arrow);
        return true;
    }

    function getArrow(i, j) {
        for (var p = 0; p < playerArrows.length; ++p) {
            var arrow = gridUtils.getAtCell(playerArrows[p], i, j);
            if (arrow) {
                return arrow;
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

    var critters = [];

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

    var lastUpdate = new Date().getTime();
    var TICK = 1000;
    var FOX_TICK = 10000;
    var currentPlayer = 0;

    function update() {
        var now = new Date().getTime();
        var delta = now - lastUpdate;

        if (delta > 1000) {
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
            critter.update(model, delta);
            if (critter.inPlay) {
                remainingCritters.push(critter);
            }
        }
        while (remainingCritters.length) {
            critters.push(remainingCritters.pop());
        }

        if (Math.floor(now / TICK) > Math.floor(lastUpdate / TICK)) {
            if (Math.floor(now / FOX_TICK) > Math.floor(lastUpdate / FOX_TICK)) {
                level.sources.forEach(function(source) {
                    critters.push(new sprites.Critter(source, sprites.FOX));
                });
            } else {
                level.sources.forEach(function(source) {
                    critters.push(new sprites.Critter(source, sprites.RABBIT));
                });
            }
        }

        lastUpdate = now;

        playerHuds.forEach(function(hud, player) {
            hud.update({
                score: playerScores[player],
                time: playerTimes[player]
            });
        });
    }

    model.width = level.width;
    model.height = level.height;
    model.sources = level.sources;
    model.sinks = level.sinks;
    model.critters = critters;
    model.playerArrows = playerArrows;
    model.playerTimes = playerTimes;
    model.registerHud = registerHud;
    model.update = update;
    model.addArrow = addArrow;
    model.cancelArrow = cancelArrow;
    model.getArrow = getArrow;
    model.modifyScore = modifyScore;

    return model;
};