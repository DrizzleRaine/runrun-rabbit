'use strict';

var userRepo = require('../repositories/user.js').build();
var usernameService = require('../services/username.js');
var viewModel = require('../views/user/model.js');

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
                    details: viewModel.create(user),
                    success: req.flash('success'),
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
                    userRepo.updateProfile(req.session.playerId, req.body)
                        .then(function() {
                            req.flash('success', 'Details updated!');
                            res.redirect('/user/details');
                        })
                        .done();
                }
            },
            '/name': {
                post: function(req, res) {
                    var handleResult = function(successMessage) {
                        return function(result) {
                            if (result.error) {
                                res.render('user/details', {
                                    username: req.body.username,
                                    persisted: false,
                                    error: result.error
                                });
                            } else {
                                req.session.playerId = result.playerId;
                                req.flash('success', successMessage);
                                res.redirect('/user/details');
                            }
                        };
                    };

                    if (req.session.playerId) {
                        userRepo.updateUsername(req.session.playerId, req.body.username)
                            .then(handleResult('Username updated!'))
                            .done();
                    } else {
                        userRepo.createUser(req.body.username)
                            .then(handleResult('Username created!'))
                            .done();
                    }
                }
            }
        }
    };
};