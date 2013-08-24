var activeGames = [];

function configure(io) {
    function start(room) {
        io.sockets.in(room).emit('start');
        io.sockets.clients(room).forEach(function (socket) {
            socket.on('placeArrow', function(data) {
                socket.broadcast.to(room).emit('placeArrow', data);
            });
            socket.on('disconnect', function() {
                socket.broadcast.to(room).emit('opponentDisconnect');
            })
        });
    }

    return {
        start: start
    }
}

module.exports = configure;