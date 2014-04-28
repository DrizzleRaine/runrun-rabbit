'use strict';

var constants = require('./constants.js');

module.exports.Timer = function Timer(totalTime) {
    var WIDTH = 900, HEIGHT = 24;

    var container = document.createElement('div');
    container.style.position = 'relative';
    container.classList.add('timer');

    var canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    container.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    function update(millis) {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        ctx.fillStyle = millis > (totalTime / 10) ?
            constants.COLOURS.NPC.FRIENDLY[0] : constants.COLOURS.NPC.ENEMY[0];

        if (millis > 0) {
            ctx.fillRect(0, 0, WIDTH * millis / totalTime, HEIGHT);
        }
    }

    return {
        view: container,
        update: update
    };
};