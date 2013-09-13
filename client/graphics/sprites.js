'use strict';

module.exports = function initSprites(grid) {
    var constants = require('./constants.js');
    var common = require('./common.js')(grid);
    var sprites = require('../../shared/sprites.js');
    var unit = constants.CELL_SIZE;

    sprites.RABBIT.view = common.preRender(function(ctx) {
        ctx.fillStyle = constants.COLOURS.NPC.FRIENDLY[0];
        ctx.drawEllipse(0, 0, unit * 11 / 24, unit / 2);
        ctx.fill();
        ctx.fillStyle = constants.COLOURS.NPC.FRIENDLY[1];
        ctx.drawCircle(0, -unit / 12, unit/6);
        ctx.fill();
        ctx.drawEllipse(-unit / 12, -unit / 4, unit / 8, unit / 4);
        ctx.fill();
        ctx.drawEllipse(unit / 12, -unit / 4, unit / 8, unit / 4);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.drawCircle(0, unit / 4, unit / 12);
        ctx.fill();
    });
    sprites.FOX.view = common.preRender(function(ctx) {
        ctx.fillStyle = constants.COLOURS.NPC.ENEMY[1];
        ctx.drawEllipse(0, 0, unit * 6 / 12, unit * 5 / 6);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, unit * 2 / 3);
        ctx.lineTo(-unit / 8, unit / 6);
        ctx.lineTo(unit / 8, unit / 6);
        ctx.lineTo(0, unit * 2 / 3);
        ctx.fill();

        ctx.fillStyle = constants.COLOURS.NPC.ENEMY[0];
        ctx.beginPath();
        ctx.moveTo(0, -unit * 2 / 3);
        ctx.lineTo(unit * 6 / 24, 0);
        ctx.lineTo(-unit * 6 / 24, 0);
        ctx.lineTo(0, -unit * 2 / 3);
        ctx.fill();

        ctx.strokeStyle = ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(0, unit * 2 / 3);
        ctx.lineTo(-unit / 16, unit * 5 / 12);
        ctx.lineTo(unit / 16, unit * 5 / 12);
        ctx.lineTo(0, unit * 2 / 3);
        ctx.stroke();
        ctx.fill();
    }, unit * 3 / 2);

    function drawCritter(critter) {
        common.render(critter.x, critter.y, critter.direction, critter.type.view);
    }

    return {
        drawCritter: drawCritter
    };
};