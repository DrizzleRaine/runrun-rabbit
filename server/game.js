'use strict';

var modelFactory = require('../shared/model.js');
var levels = require('../shared/levels.js');
var crypto = require('crypto');
var express = require('express');
var RNG = require('../shared/utils/rng.js').RNG;
var userRepo = require('./repositories/user.js').build();
var promise = require('promise');

var cookieParser = promise.denodeify(express.cookieParser(process.env.SESSION_COOKIE_SECRET));

function configure(io) {
    function start(room) {
        var gameData = {
            levelId: new Date().getTime() % levels.length,
            totalPlayers: io.sockets.clients(room).length,
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

        var playerNames = [];
        io.sockets.clients(room).forEach(function (socket, index) {
            // See https://github.com/senchalabs/connect/issues/588
            playerNames[index] =
                cookieParser(socket.handshake, {})
                    .then(function() {
                        return userRepo.fetchUser(socket.handshake.signedCookies[process.env.SESSION_COOKIE_KEY].playerId);
                    })
                    .then(function(player) { return player ? player.name : null; });
        });

        promise.all(playerNames).then(function(players) {
            io.sockets.clients(room).forEach(function (socket, index) {
                socket.emit('start', {
                    playerId: index,
                    levelId: gameData.levelId,
                    totalPlayers: gameData.totalPlayers,
                    seed: gameData.seed,
                    totalTime: gameData.totalTime,
                    logLevel: process.env.LOG_LEVEL,
                    players: players
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
        }).done();
    }

    return {
        start: start
    };
}

module.exports = configure;