'use strict';

var express = require('express');
var path = require('path');
var lobby = require('./lobby.js');
var multiplayerRoute = require('./routes/multiplayer.js');
var userRoute = require('./routes/user.js');
var passport = require('passport');
var flash = require('connect-flash');

require('./config/passport/index.js')(passport);

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
    app.use(express.cookieParser());
    app.use(express.cookieSession({
        key: process.env.SESSION_COOKIE_KEY,
        secret: process.env.SESSION_COOKIE_SECRET,
        cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 }
    }));
    app.use(flash());

    app.use(passport.initialize());

    app.set('view engine', 'html');
    app.set('views', __dirname + '/views');
    app.engine('html', require('hogan-express'));

    app.get('/auth/facebook', passport.authenticate('facebook'));
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/user/details',
            failureRedirect: '/user/details',
            failureFlash: true,
            session: false // Not using passport for session management
        }));

    app.map(multiplayerRoute());
    app.map(userRoute());

    var port = process.env.PORT || TEST_PORT;
    console.log('starting server on port ' + port);
    var server = app.listen(port, callback);
    lobby(server);
};