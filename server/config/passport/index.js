'use strict';

var FacebookStrategy = require('passport-facebook').Strategy;

module.exports = function(passport) {
    if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
        passport.use(new FacebookStrategy({
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: process.env.ROOT_URL + '/auth/facebook/callback',
            passReqToCallback: true
        }, require('./facebook.js')));
    }
};