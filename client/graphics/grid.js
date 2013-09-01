'use strict';

module.exports = function(model) {
    var constants = require('./constants.js');

    var grid = new PIXI.Graphics();
    var cellFill = 0;
    for (var i = 0; i < model.width; ++i) {
        for (var j = 0; j < model.height; ++j) {
            var cellOriginX = i * constants.CELL_SIZE;
            var cellOriginY = j * constants.CELL_SIZE;

            grid.beginFill(constants.COLOURS.CELL[cellFill], 1);
            grid.drawRect(cellOriginX, cellOriginY, constants.CELL_SIZE, constants.CELL_SIZE);

            cellFill = 1-cellFill;
        }
        cellFill = 1-cellFill;
    }
    return grid;
};