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
    var playerDivs = [];
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

        playerDiv.appendChild(avatarImage);
        playerDiv.appendChild(nameField);

        var scoreField = document.createElement('h3');
        scoreField.classList.add('score');

        var score = document.createTextNode('');
        scores.push(score);
        scoreField.appendChild(score);
        playerDiv.appendChild(scoreField);

        parent.appendChild(playerDiv, grid);
        playerDivs.push({
            player: p,
            div: playerDiv
        });
    }

    var graphics = require('../graphics/hud.js');
    var timer = new graphics.Timer(144, gameData.totalTime);
    parent.appendChild(timer.view);

    function update(stats) {
        playerDivs.sort(function(a, b) {
            return stats.score[b.player] - stats.score[a.player];
        });

        var step = (parent.offsetHeight - playerDivs[0].div.offsetHeight) / (playerDivs.length - 1);

        for (var p = 0; p < playerDivs.length; ++p) {
            playerDivs[p].div.style.zIndex = 10 - p;
            playerDivs[p].div.style.top = (p * step) + 'px';
        }

        for (p = 0; p < gameData.totalPlayers; ++p) {
            scores[p].textContent = stats.score[p].toString();
        }
        timer.update(gameData.totalTime - stats.time);
    }

    return {
        update: update
    };
};