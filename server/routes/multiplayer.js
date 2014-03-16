'use strict';

var userRepoFactory = require('../repositories/user.js');

module.exports = function() {
    var userRepo = userRepoFactory.build();

    return {
        '/multiplayer': {
            get: function(req, res) {
                var playerId = req.cookies.playerId;

                if (playerId) {
                    userRepo.fetchUser(playerId)
                        .then(function(user) {
                            if (user) {
                                res.redirect('/multiplayer/game');
                            } else {
                                res.redirect('/user/details');
                            }
                        })
                        .done();
                } else {
                    res.redirect('/user/details');
                }
            },
            '/game': {
                get: function(req, res) {
                    res.sendFile('game.html', {root: __dirname + '/../views/multiplayer'});
                }
            }
        }
    };
};