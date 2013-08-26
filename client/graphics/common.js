module.exports = function(grid) {
    var constants = require('./constants.js');

    function drawObject(drawDetail, i, j, background, alpha, direction, scale) {
        var graphics = new PIXI.Graphics();

        graphics.position.x = i * constants.CELL_SIZE + constants.CELL_SIZE / 2;
        graphics.position.y = j * constants.CELL_SIZE + constants.CELL_SIZE / 2;
        graphics.pivot.x = constants.CELL_SIZE / 2;
        graphics.pivot.y = constants.CELL_SIZE / 2;

        if (background !== null && typeof(background) != 'undefined') {
            graphics.beginFill(background, alpha);
            graphics.drawRect(0, 0, constants.CELL_SIZE, constants.CELL_SIZE);
        }

        drawDetail(graphics);
        grid.addChild(graphics);

        if (direction) {
            graphics.rotation = (direction || 0) * Math.PI / 2;
        }
        if (scale) {
            graphics.scale.x = scale;
            graphics.scale.y = scale;
        }

        return graphics;
    }

    return {
        drawObject: drawObject
    }
};