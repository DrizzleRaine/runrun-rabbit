'use strict';

var bases = require('bases');
var userRepo = require('../repositories/user.js').build();
var RNG = require('../../shared/utils/rng.js').RNG;

var random = new RNG();
var alphabet = '2345689bcdfghjmnpqrvwxz';
var MIN_VALUE = Math.pow(alphabet.length, 2);
var MAX_VALUE = Math.pow(alphabet.length, 5);

module.exports = function() {
    var displayDetails = function(req, res) {
        userRepo.fetchUser(req.cookies.playerId)
            .then(function(user) {
                var username;
                if (user) {
                    username = user.name;
                } else {
                    username = 'User_' + bases.toAlphabet(random.inRange(MIN_VALUE, MAX_VALUE), alphabet);
                }

                res.render('user/details', {
                    username: username,
                    persisted: !!user
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
                                username: req.body.username,
                                persisted: false,
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