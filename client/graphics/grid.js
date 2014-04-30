'use strict';

var CELL_SIZE = 48;

module.exports = function(model) {
    var width = model.level.width * CELL_SIZE;
    var height = model.level.height * CELL_SIZE;

    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', width.toString());
    canvas.setAttribute('height', height.toString());
    canvas.style.backgroundColor = '#CCCCCC';
    canvas.classList.add('arena');

    var context = canvas.getContext('2d');

    var clear = function clear() {
        context.clearRect(0,0, width, height);
        context.fillStyle = '#EEEEEE';
        for (var i = 0; i < model.level.width; ++i) {
            for (var j = 0; j < model.level.height; ++j) {
                if (i % 2 !== j % 2) {
                    context.fillRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            }
        }
    };

    return {
        view: canvas,
        context: context,
        clear: clear,
        unit: CELL_SIZE
    };
};