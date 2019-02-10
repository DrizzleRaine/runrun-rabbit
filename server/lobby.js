'use strict';

var PLAYERS_PER_ROOM = 2;

function configure(server) {
    var crypto = require('crypto');
    var io = require('socket.io').listen(server);
    var game = require('./game.js')(io);

    io.set('log level', 1);

    io.sockets.on('connection', function(socket) {
        var joinedRoom = false;
        for (var roomId in io.sockets.adapter.rooms) {
            if (io.sockets.adapter.rooms.hasOwnProperty(roomId) && roomId.startsWith('game:')) {
                var existingPlayersInRoom = Object.keys(io.sockets.adapter.rooms[roomId].sockets).length;
                if (existingPlayersInRoom < PLAYERS_PER_ROOM) {
                    socket.join(roomId);
                    joinedRoom = true;
                    if (existingPlayersInRoom + 1 === PLAYERS_PER_ROOM) {
                        game.start(roomId);
                    }
                    break;
                }
            }
        }
        if (!joinedRoom) {
            crypto.pseudoRandomBytes(16, function(err, buf) {
                var newRoom = 'game:' + buf.toString('base64');
                socket.join(newRoom);
            });
        }
    });
}

module.exports = configure;