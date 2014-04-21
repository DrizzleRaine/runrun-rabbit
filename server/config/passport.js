'use strict';

var userRepo = require('../repositories/user.js').build();
var username = require('../services/username.js');

var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

module.exports = function(passport) {
    if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
        passport.use(new FacebookStrategy({
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: process.env.ROOT_URL + '/auth/facebook/callback',
            passReqToCallback: true
        }, providerCallback('facebook')));
    }

    if(process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET) {
        passport.use(new TwitterStrategy({
            consumerKey: process.env.TWITTER_API_KEY,
            consumerSecret: process.env.TWITTER_API_SECRET,
            callbackURL: process.env.ROOT_URL + '/auth/twitter/callback',
            passReqToCallback: true
        }, providerCallback('twitter')));
    }

    if(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.ROOT_URL + '/auth/google/callback',
            passReqToCallback: true
        }, providerCallback('google')));
    }
};

var providerCallback = module.exports.providerCallback = function(provider) {
    return function(req, accessToken, refreshToken, profile, callback) {
        var tryCreateUser = function(attemptedName, onValidationError) {
            userRepo.createUser(attemptedName)
                .then(function(result) {
                    if (result.error) {
                        onValidationError(result.error);
                    } else {
                        req.session.playerId = result.playerId;
                        userRepo.registerAccount(result.playerId, provider, profile.id, profile.username || profile.displayName || profile.id)
                            .then(function() {
                                callback(null, true);
                            })
                            .done();
                    }
                })
                .done(null, callback);
        };

        var loginOrCreateNewUser = function(playerId) {
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
        };

        if (req.session.playerId) {
            userRepo.fetchUser(req.session.playerId)
                .then(function(user) {
                    if (user) {
                        return userRepo.registerAccount(req.session.playerId, provider, profile.id, profile.username || profile.displayName || profile.id)
                            .then(function(result) {
                                if (result) {
                                    callback(null, true);
                                } else {
                                    callback(null, false, 'This facebook account is already associated with another user');
                                }
                            });
                    } else {
                        return userRepo.getUserForAccount(provider, profile.id)
                            .then(loginOrCreateNewUser);
                    }
                })
                .done(null, callback);
        } else {
            userRepo.getUserForAccount(provider, profile.id)
                .then(loginOrCreateNewUser)
                .done(null, callback);
        }
    };
};