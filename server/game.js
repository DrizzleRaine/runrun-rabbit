'use strict';

var modelFactory = require('../shared/model.js');
var levels = require('../shared/levels.js');
var crypto = require('crypto');
var RNG = require('../shared/utils/rng.js').RNG;

function configure(io) {
    function start(room) {
        var gameData = {
            levelId: 1,
            totalPlayers: io.sockets.clients(room).length,
            seed: crypto.pseudoRandomBytes(16)
        };
        var model = modelFactory.build({
            level: levels[gameData.levelId],
            totalPlayers: gameData.totalPlayers,
            random: new RNG(gameData.seed)
        });
        var startTime = new Date().getTime();
        setInterval(function() {
            model.update(new Date().getTime() - startTime);
        }, 100);

        io.sockets.clients(room).forEach(function (socket, index) {
            socket.emit('start', {
                playerId: index,
                levelId: gameData.levelId,
                totalPlayers: gameData.totalPlayers,
                seed: gameData.seed
            });
            socket.on('placeArrow', function(arrow) {
                if (model.addArrow(index, arrow)) {
                    var arrowData = {
                        playerId: index,
                        arrow: arrow
                    };

                    socket.broadcast.to(room).emit('placeArrow', arrowData);
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