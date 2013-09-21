'use strict';

var constants = require('./constants.js');

module.exports.Timer = function Timer(unit, totalTime) {
    var container = document.createElement('div');
    container.style.position = 'relative';
    container.classList.add('timer');

    var canvas = document.createElement('canvas');
    canvas.width = unit;
    canvas.height = unit;
    var ctx = canvas.getContext('2d');
    ctx.lineWidth = unit * 3 / 24;

    var textField = document.createElement('h3');
    textField.setAttribute('class', 'time');
    textField.style.position = 'absolute';
    textField.style.top = '0px';

    var text = document.createTextNode('');
    textField.appendChild(text);
    container.appendChild(canvas);
    container.appendChild(textField);

    function update(millis) {
        ctx.clearRect(0, 0, unit, unit);

        var seconds = millis / 1000;

        ctx.strokeStyle = millis > (totalTime / 10) ?
            constants.COLOURS.NPC.FRIENDLY[0] : constants.COLOURS.NPC.ENEMY[0];

        var number = Math.ceil(seconds);
        var remainder = seconds % 1;

        if (seconds > 0) {
            for (var segment = 0; segment < remainder; segment += 0.25) {
                ctx.beginPath();
                ctx.arc(unit / 2, unit / 2, unit * 21 / 48,(1 - segment - 0.49) * Math.PI * 2,
                    (1 - segment - 0.26) * Math.PI * 2);
                ctx.stroke();
                ctx.closePath();
            }
        }

        text.textContent = number.toString();
    }

    return {
        view: container,
        update: update
    };
};