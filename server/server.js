'use strict';

var express = require('express');
var path = require('path');
var lobby = require('./lobby.js');
var multiplayerRoute = require('./routes/multiplayer.js');
var userRoute = require('./routes/user.js');
var passport = require('passport');
var flash = require('connect-flash');
var cookieSession = require('cookie-session');

require('./config/passport.js')(passport);

var TEST_PORT = 5000;

exports.start = function(callback) {
    var app = express();

    app.map = function(a, route){
        route = route || '';
        for (var key in a) {
            if (a.hasOwnProperty(key)) {
                switch (typeof a[key]) {
                case 'object':
                    // { '/path': { ... }}
                    app.map(a[key], route + key);
                    break;
                case 'function':
                    // get: function(){ ... }
                    app[key](route, a[key]);
                    break;
                }
            }
        }
    };

    app.use(express.static(path.resolve(__dirname + '/../client')));

    app.use(express.urlencoded());
    app.use(cookieSession({
        name: process.env.SESSION_COOKIE_KEY,
        keys: [process.env.SESSION_COOKIE_SECRET],
        cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 }
    }));
    app.use(flash());

    app.use(passport.initialize());

    app.set('view engine', 'html');
    app.set('views', __dirname + '/views');
    app.engine('html', require('hogan-express'));

    var passportOptions = {
        successRedirect: '/user/details',
        failureRedirect: '/user/details',
        failureFlash: true,
        session: false // Not using passport for session management
    };

    app.get('/auth/facebook', passport.authenticate('facebook'));
    app.get('/auth/facebook/callback', passport.authenticate('facebook', passportOptions));

    app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback',passport.authenticate('twitter', passportOptions));

    app.get('/auth/google', passport.authenticate('google', { scope: ['openid'] }));
    app.get('/auth/google/callback',passport.authenticate('google', passportOptions));

    app.map(multiplayerRoute());
    app.map(userRoute());

    if (process.env.GOOGLE_ANALYTICS) {
        app.get('/analytics/google.js', function (req, res) {
            res.set('Content-Type', 'application/javascript');
            res.send('(function(i,s,o,g,r,a,m){i[\'GoogleAnalyticsObject\']=r;i[r]=i[r]||function(){' +
                '(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),' +
                'm=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)' +
                '})(window,document,\'script\',\'//www.google-analytics.com/analytics.js\',\'ga\');' +
                'ga(\'create\', \'' + process.env.GOOGLE_ANALYTICS + '\', \'tineargames.com\');' +
                'ga(\'send\', \'pageview\');');
        });
    }

    var port = process.env.PORT || TEST_PORT;
    console.log('starting server on port ' + port);
    var server = app.listen(port, callback);
    lobby(server);
};