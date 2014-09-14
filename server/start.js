'use strict';

var server = require('./server.js');
console.info('Server starting...');
server.start(function() {
    console.info('... Server started.');
});