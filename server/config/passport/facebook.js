'use strict';

var userRepo = require('../../repositories/user.js').build();
var username = require('../../services/username.js');

module.exports = function(req, accessToken, refreshToken, profile, callback) {
    var tryCreateUser = function(attemptedName, onValidationError) {
        userRepo.createUser(attemptedName)
            .then(function(result) {
                if (result.error) {
                    onValidationError(result.error);
                } else {
                    req.session.playerId = result.playerId;
                    userRepo.registerAccount(result.playerId, 'facebook', profile.id)
                        .then(function() {
                            callback(null, true);
                        })
                        .done();
                }
            })
            .done(null, callback);
    };

    if (req.session.playerId) {
        userRepo.registerAccount(req.session.playerId, 'facebook', profile.id)
            .then(function(result) {
                if (result) {
                    callback(null, true);
                } else {
                    callback(null, false, 'This facebook account is already associated with another user');
                }
            })
            .done(null, callback);
    } else {
        userRepo.getUserForAccount('facebook', profile.id)
            .then(function(playerId) {
                if (playerId) {
                    req.session.playerId = playerId;
                    callback(null, true);
                } else {
                    tryCreateUser(profile.username, function() {
                        tryCreateUser(profile.displayName, function() {
                            tryCreateUser(username.generate(), callback);
                        });
                    });
                }
            })
            .done(null, callback);
    }
};