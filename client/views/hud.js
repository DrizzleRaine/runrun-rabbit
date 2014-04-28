'use strict';

var gravatar = require('gravatar');

exports.build = function build(parent, gameData) {
    if (!gameData) {
        return {
            update: function() {}
        };
    }

    var grid = parent.firstChild;

    var scores = [];
    for (var p = 0; p < gameData.totalPlayers; ++p) {
        var playerDiv = document.createElement('div');
        playerDiv.classList.add('player');
        playerDiv.classList.add('player-' + p);

        var nameField = document.createElement('h4');
        var name = document.createTextNode(gameData.players[p].name);
        nameField.appendChild(name);

        var avatarImage = document.createElement('img');
        avatarImage.setAttribute('src',
            gravatar.url(gameData.players[p].gravatar || '', { d: 'mm', s: 128 }));

        playerDiv.appendChild(nameField);
        playerDiv.appendChild(avatarImage);

        var scoreField = document.createElement('h3');
        scoreField.classList.add('score');

        var score = document.createTextNode('');
        scores.push(score);
        scoreField.appendChild(score);
        playerDiv.appendChild(scoreField);

        parent.insertBefore(playerDiv, grid);
    }

    var graphics = require('../graphics/hud.js');
    var timer = new graphics.Timer(gameData.totalTime);
    parent.appendChild(timer.view);

    function update(stats) {
        for (var p = 0; p < gameData.totalPlayers; ++p) {
            scores[p].textContent = stats.score[p].toString();
        }
        timer.update(gameData.totalTime - stats.time);
    }

    return {
        update: update
    };
};