'use strict';

var CELL_SIZE = 48;

module.exports = function(model) {
    var width = model.level.width * CELL_SIZE;
    var height = model.level.height * CELL_SIZE;

    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', width.toString());
    canvas.setAttribute('height', height.toString());
    canvas.style.backgroundImage = 'url("./background.png")';
    canvas.classList.add('arena');

    var context = canvas.getContext('2d');

    var clear = function clear() {
        context.clearRect(0,0, width, height);
    };

    return {
        view: canvas,
        context: context,
        clear: clear,
        unit: CELL_SIZE
    };
};