module.exports = (function() {
    var activeKey = null;

    var modelFactory = require('../shared/model.js');
    var levels = require('../shared/levels.js');
    var direction = require('../shared/utils/direction.js');

    var model;
    var playArea;
    var socket;

    function startGame() {
        model = modelFactory.build(levels[1]);

        var container = document.getElementById('game');
        playArea = require('./views/arena.js').build(container, model);

        playArea.click(function(cell) {
            if (activeKey !== null) {
                var newArrow = {
                    x: cell.x,
                    y: cell.y,
                    d: direction.fromKey(activeKey)
                };

                model.addArrow(0, newArrow);
                if (socket) {
                    socket.emit('placeArrow', newArrow);
                }
            }
        });

        var hudFactory = require('./views/hud.js');
        $.each(model.playerTimes, function(player) {
            model.registerHud(hudFactory.build(container, player), player);
        });
    }

    var init = function(multiplayer) {
        window.oncontextmenu = function() { return false };

        $(document).keydown(function (event) {
            if (direction.fromKey(event.keyCode) !== null) {
                activeKey = event.keyCode;
                event.preventDefault();
            }
        });

        $(document).keyup(function (event) {
            if (event.keyCode === activeKey) {
                activeKey = null;
            }
        });

        if (multiplayer) {
            socket = io.connect('/');
            socket.on('start', startGame);

            socket.on('placeArrow', function (data) {
                if (model) {
                    model.addArrow(1, data);
                }
            });

            socket.on('disconnect', disconnect);
            socket.on('opponentDisconnect', disconnect);

            function disconnect() {
                playArea.close();
                model = null;
                playArea = null;
            }
        } else {
            startGame();
        }
    };

    return {
        init: init
    }

}());