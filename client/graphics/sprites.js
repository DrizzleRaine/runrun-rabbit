'use strict';

module.exports = function initSprites(grid) {
    var constants = require('./constants.js');
    var common = require('./common.js')(grid);
    var sprites = require('../../shared/sprites.js');
    var unit = constants.CELL_SIZE;

    sprites.RABBIT.view = common.preRender(function(ctx) {
        ctx.fillStyle = constants.COLOURS.NPC.FRIENDLY[0];
        // Body
        ctx.drawEllipse(0, 0, unit * 11 / 24, unit / 2);
        ctx.fill();
        ctx.fillStyle = constants.COLOURS.NPC.FRIENDLY[1];
        // Head
        ctx.drawCircle(0, -unit / 12, unit/6);
        ctx.fill();
        // Ears
        ctx.drawEllipse(-unit / 12, -unit / 4, unit / 8, unit / 4);
        ctx.fill();
        ctx.drawEllipse(unit / 12, -unit / 4, unit / 8, unit / 4);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        // Tail
        ctx.drawCircle(0, unit / 4, unit / 12);
        ctx.fill();
    });

    sprites.FOX.view = common.preRender(function(ctx) {
        // Body
        ctx.fillStyle = constants.COLOURS.NPC.ENEMY[1];
        ctx.drawEllipse(0, unit/48, unit * 7/12, unit * 3 / 4);
        ctx.fill();
        // Root of the tail
        ctx.beginPath();
        ctx.moveTo(-unit/6, unit * 13/48);
        ctx.quadraticCurveTo(-unit*4/24, unit*7/16, 0, unit*23/48);
        ctx.lineTo(unit/12, unit*19/48);
        ctx.quadraticCurveTo(unit*3/24, unit*7/16, -unit/6, unit*13/48);
        ctx.fill();
        ctx.fillStyle = constants.COLOURS.NPC.ENEMY[0];
        // Head
        ctx.drawEllipse(0, -unit * 7 / 48, unit / 3, unit / 2);
        ctx.fill();
        // Snout
        ctx.beginPath();
        ctx.moveTo(-unit / 12, -unit * 17 / 48);
        ctx.quadraticCurveTo(0, -unit * 31/48, unit / 12, -unit * 17/48);
        ctx.lineTo(-unit / 12, -unit * 17 / 48);
        ctx.fill();
        ctx.fillStyle = constants.COLOURS.NPC.ENEMY[2];
        // Ears
        ctx.beginPath();
        ctx.moveTo(-unit/6, -unit/48);
        ctx.lineTo(-unit/12, -unit*9/48);
        ctx.lineTo(-unit/24, -unit/48);
        ctx.fill();
        ctx.moveTo(unit/6, -unit/48);
        ctx.lineTo(unit/12, -unit*9/48);
        ctx.lineTo(unit/24, -unit/48);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        // Tip of the tail
        ctx.beginPath();
        ctx.moveTo(unit/4, unit * 19/48);
        ctx.quadraticCurveTo(unit/8, unit*25/48, 0, unit*23/48);
        ctx.lineTo(unit/24, unit*19/48);
        ctx.quadraticCurveTo(unit*3/24, unit*21/48, unit/4, unit * 19/48);
        ctx.fill();
    });

    function drawCritter(critter) {
        common.render(critter.x, critter.y, critter.direction, critter.type.view);
    }

    return {
        drawCritter: drawCritter
    };
};