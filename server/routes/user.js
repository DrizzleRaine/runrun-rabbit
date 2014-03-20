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
                    userRepo.createUser(req.body.username, function(error, userId) {
                        if (error) {
                            res.render('user/details', {
                                error: error
                            });
                        } else {
                            res.cookie('playerId', userId, { expires: new Date(9999, 11), httpOnly: true });
                            res.redirect('/user/details');
                        }
                    });
                }
            }
        }
    };
};