module.exports = function(grid) {
    var constants = require('./constants.js');
    var common = require('./common.js')(grid);

    function drawCritter(critter) {
        common.drawObject(function(graphics, unit) {
            graphics.beginFill(constants.COLOURS.NPC.FRIENDLY[0]);
            graphics.drawElipse(unit / 2, unit / 2, unit * 11 / 48, unit / 4);
            graphics.beginFill(constants.COLOURS.NPC.FRIENDLY[1]);
            graphics.drawCircle(unit / 2, unit * 5 / 12, unit / 6);
            graphics.drawElipse(unit * 5 / 12, unit / 4, unit / 16, unit / 8);
            graphics.drawElipse(unit * 7 / 12, unit / 4, unit / 16, unit / 8);
            graphics.beginFill(0xFFFFFF);
            graphics.drawCircle(unit / 2, unit * 3 / 4, unit / 12);
        }, critter.x, critter.y, null, null, critter.direction);
    }

    return {
        drawCritter: drawCritter
    }
};