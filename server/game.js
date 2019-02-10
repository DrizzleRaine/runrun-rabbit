'use strict';

var modelFactory = require('../shared/model.js');
var levels = require('../shared/levels.js');
var crypto = require('crypto');
var cookieSession = require('cookie-session');
var RNG = require('../shared/utils/rng.js').RNG;
var userRepo = require('./repositories/user.js').build();
var promise = require('promise');

function configure(io) {
    var playerSockets = {};
    io.on('connect', function(socket) {
        var clientId = socket.client.id;
        cookieSession({
            name: process.env.SESSION_COOKIE_KEY,
            keys: [process.env.SESSION_COOKIE_SECRET]})(socket.handshake, {}, function() {
                playerSockets[clientId] = socket;
            });

        socket.on('disconnect', function() {
            delete playerSockets[clientId];
        });
    });

    function start(room) {
        return promise.denodeify(io.in(room).clients).bind(io.in(room))().then(function(clients) {
            var gameData = {
                levelId: new Date().getTime() % levels.length,
                totalPlayers: clients.length,
                seed: crypto.pseudoRandomBytes(16),
                totalTime: 90000
            };
            var model = modelFactory.build({
                level: levels[gameData.levelId],
                totalPlayers: gameData.totalPlayers,
                random: new RNG(gameData.seed),
                totalTime: gameData.totalTime,
                logLevel: process.env.LOG_LEVEL
            });
    
            var startGame = function startGame() {
                var startTime = new Date().getTime();
                var interval = setInterval(function() {
                    model.update(new Date().getTime() - startTime);
                    if (!model.isRunning) {
                        clearInterval(interval);
                    }
                }, 500);
            };
    
            var clientsStarted = 0;
    
            var players = clients.map(function(client) {
                return userRepo.fetchUser(playerSockets[client].handshake.session.playerId);
            });
    
            return promise.all(players).then(function(loadedPlayers) {
                clients.forEach(function (client, index) {
                    var socket = playerSockets[client];
                    socket.emit('start', {
                        playerId: index,
                        levelId: gameData.levelId,
                        totalPlayers: gameData.totalPlayers,
                        seed: gameData.seed,
                        totalTime: gameData.totalTime,
                        logLevel: process.env.LOG_LEVEL,
                        players: loadedPlayers
                    });
                    socket.on('placeArrow', function(arrow) {
                        if (model.addArrow(index, arrow)) {
                            var arrowData = {
                                playerId: index,
                                arrow: arrow
                            };
    
                            socket.broadcast.to(room).emit('placeArrow', arrowData);
                        }
                    });
                    socket.on('started', function clientStarted() {
                        if (++clientsStarted === gameData.totalPlayers) {
                            startGame();
                        }
                    });
                    socket.on('disconnect', function socketDisconnect() {
                        socket.broadcast.to(room).emit('opponentDisconnect');
                    });
                });
            }); 
        }).done();
    }

    return {
        start: start
    };
}

module.exports = configure;