'use strict';

module.exports = function(req, res){
    res.sendfile('game.html', {root: __dirname + '/../views/multiplayer'});
};