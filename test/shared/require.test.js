/**
 * This is actually mainly here to make sure all files show up in coverage reports (as there
 * doesn't seem to be a way to force Istanbul to include files with zero coverage), although
 * there's also some value in making sure nothing immediately blows up when loaded via require
 */

'use strict';

var fs = require('fs');
var path = require('path');

var excludes = ['graphics', 'start.js', 'main.js', 'input.js'];

function processDir(dir) {
    fs.readdirSync(dir).forEach(function(file) {
        if (excludes.indexOf(file) === -1) {
            var fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                processDir(fullPath);
            } else if (file.match(/\.js$/)) {
                require(fullPath);
            }
        }
    });
}

['client','server','shared'].forEach(function(root) {
    var dir = path.join(__dirname, '../..', (process.env.SOURCE_ROOT || '/'), root);
    processDir(dir);
});