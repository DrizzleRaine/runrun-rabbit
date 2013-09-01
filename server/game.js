'use strict';

var modelFactory = require('../shared/model.js');

function configure(io) {
    function start(room) {
        var gameData = {
            levelId: 1
        };
        var model = modelFactory.build(gameData);

        io.sockets.clients(room).forEach(function (socket, index) {
            socket.emit('start', {
                playerId: index,
                levelId: gameData.levelId
            });
            socket.on('placeArrow', function(arrow) {
                arrow.confirmed = true;
                if (model.addArrow(index, arrow)) {
                    var arrowData = {
                        playerId: index,
                        arrow: arrow
                    };

                    io.sockets.in(room).emit('placeArrow', arrowData);
                } else {
                    socket.emit('cancelArrow', arrow);
                }
            });
            socket.on('disconnect', function() {
                socket.broadcast.to(room).emit('opponentDisconnect');
            });
        });
    }

    return {
        start: start
    };
}

module.exports = configure;