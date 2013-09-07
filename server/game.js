'use strict';

var modelFactory = require('../shared/model.js');
var crypto = require('crypto');

function configure(io) {
    function start(room) {
        var gameData = {
            levelId: 1,
            totalPlayers: io.sockets.clients(room).length,
            seed: crypto.pseudoRandomBytes(16)
        };
        var model = modelFactory.build(gameData);
        setInterval(model.update, 100);

        io.sockets.clients(room).forEach(function (socket, index) {
            socket.emit('start', {
                playerId: index,
                levelId: gameData.levelId,
                totalPlayers: gameData.totalPlayers,
                seed: gameData.seed
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
            socket.on('disconnect', function socketDisconnect() {
                socket.broadcast.to(room).emit('opponentDisconnect');
            });
        });
    }

    return {
        start: start
    };
}

module.exports = configure;