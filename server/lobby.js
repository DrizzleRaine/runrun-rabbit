'use strict';

function configure(server) {
    var crypto = require('crypto');
    var io = require('socket.io').listen(server);
    var game = require('./game.js')(io);

    io.sockets.on('connection', function(socket) {
        var joinedRoom = false;
        for (var room in io.sockets.manager.rooms) {
            if (room.length > 0 && io.sockets.manager.rooms.hasOwnProperty(room)) {
                room = room.substr(1);
                if (io.sockets.clients(room).length === 1) {
                    socket.join(room);
                    joinedRoom = true;
                    game.start(room);
                    break;
                }
            }
        }
        if (!joinedRoom) {
            crypto.pseudoRandomBytes(16, function(err, buf) {
                socket.join(buf.toString());
            });
        }
    });
}

module.exports = configure;