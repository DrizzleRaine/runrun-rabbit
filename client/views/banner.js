'use strict';

module.exports = function build(parent) {
    var MINI = window.require('minified');
    var $ = MINI.$;//, $$=MINI.$$, EE=MINI.EE;

    var unit = 256;
    var width = 4;

    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', (unit * width).toString());
    canvas.setAttribute('height', unit.toString());
    canvas.style.backgroundColor = '#DDDDDD';
    canvas.classList.add('banner');

    var context = canvas.getContext('2d');

    var clear = function clear() {
        context.clearRect(0,0, $(canvas).get('width'), unit);
    };

    var grid = {
        view: canvas,
        context: context,
        clear: clear,
        unit: unit
    };

    var sprites = require('../graphics/sprites.js')(grid);

    var startTime = new Date().getTime();

    var rabbit = {
        x: 0,
        y: 0,
        direction: 1,
        type: {
            name: 'rabbit',
            speed: 0.0012
        },
        inPlay: true,
        isAlive: true,
        lastUpdate: startTime
    };

    var fox = {
        x: -1,
        y: 0,
        direction: 1,
        type: {
            name: 'fox',
            speed: 0.0011
        },
        inPlay: true,
        isAlive: true,
        lastUpdate: startTime
    };

    var critters = [fox, rabbit];

    function animate() {
        var currentTime = new Date().getTime();

        clear();

        context.fillStyle = '#EEEEEE';
        context.fillRect(unit / 2, 0, unit, unit);
        context.fillRect(unit * 5 / 2, 0, unit, unit);

        critters.forEach(function(critter) {
            sprites.drawCritter(critter, currentTime);
        });

        if ((fox.type.speed * (currentTime - fox.lastUpdate)) > (1 + $(canvas).get('width') / unit)) {
            rabbit.direction = fox.direction = 4 - rabbit.direction;
            rabbit.x = width - rabbit.x;
            fox.x = width - fox.x;
            rabbit.lastUpdate = currentTime;
            fox.lastUpdate = currentTime;
        }

        window.requestAnimationFrame(animate);
    }

    parent.appendChild(canvas);

    window.requestAnimationFrame(animate);

    return canvas;
};