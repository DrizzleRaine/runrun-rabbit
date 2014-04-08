'use strict';

var userRepo = require('../repositories/user.js').build();
var usernameService = require('../services/username.js');

module.exports = function() {
    var displayDetails = function(req, res) {
        userRepo.fetchUser(req.session.playerId)
            .then(function(user) {
                var username;
                if (user) {
                    username = user.name;
                } else {
                    username = usernameService.generate();
                }

                res.render('user/details', {
                    username: username,
                    persisted: !!user,
                    error: req.flash('error')
                });
            })
            .done();
    };

    return {
        '/user': {
            '/details': {
                get: displayDetails,
                post: function(req, res) {
                    userRepo.createUser(req.body.username)
                        .then(function(result) {
                            if (result.error) {
                                res.render('user/details', {
                                    username: req.body.username,
                                    persisted: false,
                                    error: result.error
                                });
                            } else {
                                req.session.playerId = result.playerId;
                                res.redirect('/user/details');
                            }
                        })
                        .done();
                }
            }
        }
    };
};