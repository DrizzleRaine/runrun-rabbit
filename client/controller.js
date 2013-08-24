module.exports = (function() {
    var keyMap = {
        87: 0,
        38: 0,
        68: 1,
        39: 1,
        83: 2,
        40: 2,
        65: 3,
        37: 3
    };

    var activeKey = null;

    var modelFactory = require('../shared/model.js');
    var viewFactory = require('./view.js');

    var model;
    var view;
    var socket;

    function startGame() {
        model = modelFactory.build();
        view = viewFactory.build(document.getElementById('game'), model);

        view.click(function(cell) {
            if (activeKey !== null) {
                var newArrow = {
                    x: cell.x,
                    y: cell.y,
                    d: keyMap[activeKey]
                };

                model.addArrow(0, newArrow);
                socket.emit('placeArrow', newArrow);
            }
        });
    }

    var init = function() {
        window.oncontextmenu = function() { return false };

        $(document).keydown(function (event) {
            if (keyMap.hasOwnProperty(event.keyCode.toString())) {
                activeKey = event.keyCode;
            }
        });

        $(document).keyup(function (event) {
            if (event.keyCode === activeKey) {
                activeKey = null;
            }
        });

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
            view.close();
            model = null;
            view = null;
        }
    };

    return {
        init: init
    }

}());