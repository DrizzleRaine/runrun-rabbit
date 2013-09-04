'use strict';

var buttonClass = ['primary', 'success'];

exports.build = function build(parent, player) {
    var graphics = require('../graphics/hud.js');
    var constants = require('../graphics/constants.js');

    var doneCallback;

    var stage = new PIXI.Stage(0xFFFFFF);
    var renderer = new PIXI.CanvasRenderer(144, 144);

    var timer = new graphics.Timer(constants.COLOURS.PLAYER[player], 144);
    stage.addChild(timer);

    var hudDiv = document.createElement('div');
    hudDiv.setAttribute('class', 'hud');
    hudDiv.setAttribute('id', 'hud-' + player);

    var doneButton = document.createElement('button');
    doneButton.setAttribute('type', 'button');
    doneButton.setAttribute('class', 'btn btn-lg player-' + player);
    doneButton.appendChild(document.createTextNode('Done'));
    hudDiv.appendChild(doneButton);

    var scoreHeader = document.createElement('h2');
    scoreHeader.setAttribute('class', 'score');
    scoreHeader.appendChild(document.createTextNode('Score:'));
    hudDiv.appendChild(scoreHeader);

    var scoreField = document.createElement('h3');
    scoreField.setAttribute('class', 'score');

    var score = document.createTextNode('');
    scoreField.appendChild(score);
    hudDiv.appendChild(scoreField);

    var timeHeader = document.createElement('h2');
    timeHeader.appendChild(document.createTextNode('Time:'));
    hudDiv.appendChild(timeHeader);

    hudDiv.appendChild(renderer.view);

    parent.appendChild(hudDiv);

    doneButton.onclick = function() {
        if (doneCallback) {
            doneCallback();
        }
    };

    function update(stats) {
        score.textContent = stats.score;
        timer.update(stats.time);
        window.requestAnimationFrame(function() { renderer.render(stage); });
    }

    return {
        done: function(callback) { doneCallback = callback; },
        update: update
    };
};