'use strict';

var lobby = require('./lobby.js');

var TEST_PORT = 5000;

exports.start = function(callback) {

    var port = process.env.PORT || TEST_PORT;
    var fs = require('fs');

    function handler (req, res) {
        var url = req.url;
        if (url === '/') {
            url = '/index.html';
        }

        fs.readFile(__dirname + '/../client' + url,
            function (err, data) {
                if (err) {
                    res.writeHead(500);
                    res.end('Error loading ' + url);
                    return;
                }

                res.writeHead(200);
                res.end(data);
            });
    }

    var server = require('http').createServer(handler);
    console.log('starting server on port ' + port);
    server.listen(port, callback);
    lobby(server);
};