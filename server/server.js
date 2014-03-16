'use strict';

var express = require('express');
var path = require('path');
var lobby = require('./lobby.js');
var multiplayerRoute = require('./routes/multiplayer.js');
var userRoute = require('./routes/user.js');

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

    app.use(express.bodyParser());
    app.use(express.cookieParser());

    app.map(multiplayerRoute());
    app.map(userRoute());

    var port = process.env.PORT || TEST_PORT;
    console.log('starting server on port ' + port);
    var server = app.listen(port, callback);
    lobby(server);
};