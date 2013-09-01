'use strict';

var express = require('express');
var path = require('path');
var lobby = require('./lobby.js');

var server;

exports.TEST_PORT = 5000;

exports.start = function(callback) {
    var app = express();

    app.use(express.static(path.resolve(__dirname + '/../client')));

    var port = process.env.PORT || exports.TEST_PORT;
    console.log('starting server on port ' + port);
    server = app.listen(port, callback);

    lobby(server);
};

exports.stop = function(callback) {
    server.close(callback);
};