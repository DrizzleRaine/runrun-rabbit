'use strict';

var arrayUtils = require('./utils/array.js');

var PlayerScores = module.exports.PlayerScores = function PlayerScores(totalPlayers) {
    this.history = [];
    this.current = this.history[0] = arrayUtils.initialise(totalPlayers, 0);
};

PlayerScores.prototype.save = function saveScores(tick) {
    this.history[tick] = this.current.concat();
};

PlayerScores.prototype.restore = function restoreScores(tick) {
    this.current = this.history[tick];
};

PlayerScores.prototype.modify = function modifyScore(player, modifier) {
    this.current[player] = modifier(this.current[player]);
};