'use strict';

var userRepo = require('../repositories/user.js').build();

module.exports = function() {
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
                    res.render('multiplayer/game');
                }
            }
        }
    };
};