'use strict';

var userRepo = require('../repositories/user.js').build();

module.exports = function() {
    var displayDetails = function(req, res) {
        userRepo.fetchUser(req.cookies.playerId)
            .then(function(user) {
                res.render('user/details', {
                    user: user
                });
            })
            .done();
    };

    return {
        '/user': {
            '/details': {
                get: displayDetails,
                post: function(req, res) {
                    if (req.body.username) {
                        userRepo.createUser(req.body.username, function(error, userId) {
                            if (error) {
                                res.render('user/details', {
                                    user: userRepo.fetchUser(req.cookies.playerId),
                                    error: error
                                });
                            }
                            res.cookie('playerId', userId);
                            res.redirect('/user/details');
                        });
                    } else {
                        displayDetails(req, res);
                    }
                }
            }
        }
    };
};