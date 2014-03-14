'use strict';

module.exports = function initCursors(grid) {
    var constants = require('./constants.js');
    var common = require('./common.js')(grid);

    var cursors = [];

    var renderCursor = function(player) {
        return function (ctx) {
            ctx.fillStyle = constants.COLOURS.PLAYER[player];
            ctx.globalAlpha = 0.8;

            ctx.beginPath();
            ctx.moveTo(-grid.unit / 2, -grid.unit / 2);
            ctx.lineTo(grid.unit / 2, -grid.unit / 6);
            ctx.quadraticCurveTo(0, 0, -grid.unit / 6, grid.unit / 2);
            ctx.lineTo(-grid.unit / 2, -grid.unit / 2);
            ctx.fill();
        };
    };

    for (var i = 0; i < constants.COLOURS.PLAYER.length; ++i) {
        cursors[i] = common.preRender(renderCursor(i));
    }

    function drawCursor(player, x, y) {
        common.renderStatic(x / grid.unit, y / grid.unit, cursors[player]);
    }

    return {
        drawCursor: drawCursor
    };
};