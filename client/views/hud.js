'use strict';

exports.build = function build(parent, gameData) {
    if (!gameData) {
        return {
            update: function() {}
        };
    }

    var graphics = require('../graphics/hud.js');

    var timer = new graphics.Timer(144, gameData.totalTime);

    var hudDiv = document.createElement('div');
    hudDiv.setAttribute('class', 'hud');

    var scores = [];

    for (var p = 0; p < gameData.totalPlayers; ++p) {
        if (p === Math.floor(gameData.totalPlayers / 2)) {
            hudDiv.appendChild(timer.view);
        }

        var scoreField = document.createElement('h3');
        scoreField.classList.add('score');
        scoreField.classList.add('player-' + p);

        var score = document.createTextNode('');
        scores.push(score);
        scoreField.appendChild(score);
        hudDiv.appendChild(scoreField);
    }

    for (p = 0; p < gameData.totalPlayers; ++p) {
        var nameField = document.createElement('h4');
        var name = document.createTextNode(gameData.players[p]);
        nameField.appendChild(name);
        hudDiv.appendChild(nameField);
    }

    parent.appendChild(hudDiv);

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