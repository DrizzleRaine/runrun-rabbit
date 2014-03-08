'use strict';

module.exports = function build(parent) {
    var unit = 256;
    var width = 4;

    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', (unit * width).toString());
    canvas.setAttribute('height', unit.toString());
    canvas.style.backgroundColor = '#DDDDDD';
    canvas.classList.add('banner');
    canvas.classList.add('hidden');

    var context = canvas.getContext('2d');

    var clear = function clear() {
        context.clearRect(0,0, $(canvas).attr('width'), unit);
    };

    var isRunning = false;

    var show = function() {
        isRunning = true;
        window.requestAnimationFrame(animate);
        canvas.classList.remove('hidden');
    };

    var hide = function() {
        isRunning = false;
        canvas.classList.add('hidden');
    };

    var banner = {
        view: canvas,
        context: context,
        clear: clear,
        unit: unit,
        show: show,
        hide: hide
    };

    var sprites = require('../graphics/sprites.js')(banner);

    var startTime = new Date().getTime();

    var rabbit = {
        x: -1,
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
        x: -2,
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
        if (!isRunning) {
            return;
        }

        var currentTime = new Date().getTime();

        clear();

        context.fillStyle = '#EEEEEE';
        context.fillRect(unit / 2, 0, unit, unit);
        context.fillRect(unit * 5 / 2, 0, unit, unit);

        critters.forEach(function(critter) {
            sprites.drawCritter(critter, currentTime);
        });

        if ((fox.type.speed * (currentTime - fox.lastUpdate)) > (width + 2)) {
            rabbit.direction = fox.direction = 4 - rabbit.direction;
            rabbit.x = width - 1 - rabbit.x;
            fox.x = width - 1 - fox.x;
            rabbit.lastUpdate = currentTime;
            fox.lastUpdate = currentTime;
        }

        window.requestAnimationFrame(animate);
    }

    parent.appendChild(canvas);

    return banner;
};