'use strict';

var userRepo = require('../../repositories/user.js').build();
var username = require('../../services/username.js');

module.exports = function(req, accessToken, refreshToken, profile, done) {
    var tryCreateUser = function(attemptedName, onValidationError) {
        userRepo.createUser(attemptedName, function(error, result) {
            if (error) {
                done(error);
            } else {
                if (result.error) {
                    onValidationError(result.error);
                } else {
                    req.session.playerId = result.playerId;
                    userRepo.registerAccount(result.playerId, 'facebook', profile.id, function(error) {
                        if (error) {
                            done(error);
                        } else {
                            done(null, true);
                        }
                    });
                }
            }
        });
    };

    if (req.session.playerId) {
        userRepo.registerAccount(req.session.playerId, 'facebook', profile.id, function(error, result) {
            if (error) {
                done(error);
            } else if (result) {
                done(null, true);
            } else {
                done(null, false, 'This facebook account is already associated with another user');
            }
        });
    } else {
        userRepo.getUserForAccount('facebook', profile.id, function(error, playerId) {
            if (error) {
                done(error);
            } else if (playerId) {
                req.session.playerId = playerId;
                done(null, true);
            } else {
                tryCreateUser(profile.username, function() {
                    tryCreateUser(profile.displayName, function() {
                        tryCreateUser(username.generate(), done);
                    });
                });
            }
        });
    }
};