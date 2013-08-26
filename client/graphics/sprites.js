module.exports = function(grid) {
    var constants = require('./constants.js');
    var common = require('./common.js')(grid);

    function drawCritter(critter) {
        common.drawObject(function(graphics) {
            graphics.beginFill(constants.COLOURS.NPC.FRIENDLY);
            graphics.drawCircle(constants.CELL_SIZE / 2, constants.CELL_SIZE / 2, constants.CELL_SIZE / 4);
        }, critter.x, critter.y, null, null, critter.direction);
    }

    return {
        drawCritter: drawCritter
    }
};