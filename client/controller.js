'use strict';

var modelFactory = require('../shared/model.js');
var levels = require('../shared/levels.js');
var RNG = require('../shared/utils/rng.js').RNG;

module.exports = (function() {
    var model;
    var arena;
    var socket;

    function startGame(gameData) {
        gameData.level = levels[gameData.levelId];
        gameData.random = new RNG(gameData.seed);
        model = modelFactory.build(gameData);

        var container = document.getElementById('game');
        arena = require('./views/arena.js')(container, model, function placeArrow(newArrow) {
            if (model.addArrow(gameData.playerId, newArrow) && socket) {
                socket.emit('placeArrow', newArrow);
            }
        });

        if (socket) {
            socket.on('placeArrow', function (arrowData) {
                model.addArrow(arrowData.playerId, arrowData.arrow);
            });
            socket.emit('started');
        }

        var hudFactory = require('./views/hud.js');
        model.registerHud(hudFactory.build(container, gameData));
    }

    var init = function init(multiplayer) {
        if (multiplayer) {
            socket = io.connect('/');
            socket.on('start', startGame);

            var disconnect = function disconnect() {
                arena.close();
                model = null;
                arena = null;
            };
            socket.on('disconnect', disconnect);
            socket.on('opponentDisconnect', disconnect);
        } else {
            startGame({
                playerId: 0,
                levelId: 1,
                totalPlayers: 2,
                totalTime: 90000
            });
        }
    };

    return {
        init: init
    };

}());