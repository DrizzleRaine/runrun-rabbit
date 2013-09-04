'use strict';

module.exports = (function() {
    var activeKey = null;

    var modelFactory = require('../shared/model.js');
    var direction = require('../shared/utils/direction.js');

    var model;
    var playArea;
    var socket;

    function startGame(gameData) {
        model = modelFactory.build(gameData);

        var container = document.getElementById('game');
        playArea = require('./views/arena.js').build(container, model);

        playArea.click(function(cell) {
            if (activeKey !== null) {
                var newArrow = {
                    x: cell.x,
                    y: cell.y,
                    d: direction.fromKey(activeKey),
                    confirmed: !socket
                };

                if (model.addArrow(gameData.playerId, newArrow) && socket) {
                    socket.emit('placeArrow', newArrow);
                }

            }
        });

        if (socket) {
            socket.on('placeArrow', function (arrowData) {
                model.addArrow(arrowData.playerId, arrowData.arrow);
            });

            socket.on('cancelArrow', function (data) {
                model.cancelArrow(data);
            });
        }

        var hudFactory = require('./views/hud.js');
        for (var player = 0; player < gameData.totalPlayers; ++player) {
            model.registerHud(hudFactory.build(container, player), player);
        }
    }

    var init = function(multiplayer) {
        window.oncontextmenu = function() { return false; };

        document.onkeydown = function (event) {
            if (direction.fromKey(event.keyCode) !== null) {
                activeKey = event.keyCode;
                event.preventDefault();
            }
        };

        document.onkeyup = function (event) {
            if (event.keyCode === activeKey) {
                activeKey = null;
            }
        };

        if (multiplayer) {
            socket = io.connect('/');
            socket.on('start', startGame);

            var disconnect = function disconnect() {
                playArea.close();
                model = null;
                playArea = null;
            };
            socket.on('disconnect', disconnect);
            socket.on('opponentDisconnect', disconnect);
        } else {
            startGame({
                playerId: 0,
                levelId: 1,
                totalPlayers: 2
            });
        }
    };

    return {
        init: init
    };

}());