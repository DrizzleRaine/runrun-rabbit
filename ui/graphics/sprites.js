'use strict';

module.exports = function initSprites(grid) {
    var constants = require('./constants.js');
    var common = require('./common.js')(grid);
    var sprites = require('../../shared/sprites.js');
    var directionUtils = require('../../shared/utils/direction.js');

    var views = {};

    views[sprites.RABBIT.name] = common.preRender(function(ctx) {
        ctx.fillStyle = constants.COLOURS.NPC.FRIENDLY[0];
        // Body
        ctx.drawEllipse(0, 0, grid.unit * 11 / 24, grid.unit / 2);
        ctx.fill();
        ctx.fillStyle = constants.COLOURS.NPC.FRIENDLY[1];
        // Head
        ctx.drawCircle(0, -grid.unit / 12, grid.unit/6);
        ctx.fill();
        // Ears
        ctx.drawEllipse(-grid.unit / 12, -grid.unit / 4, grid.unit / 8, grid.unit / 4);
        ctx.fill();
        ctx.drawEllipse(grid.unit / 12, -grid.unit / 4, grid.unit / 8, grid.unit / 4);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        // Tail
        ctx.drawCircle(0, grid.unit / 4, grid.unit / 12);
        ctx.fill();
    });

    views[sprites.FOX.name] = common.preRender(function(ctx) {
        // Body
        ctx.fillStyle = constants.COLOURS.NPC.ENEMY[1];
        ctx.drawEllipse(0, grid.unit/48, grid.unit * 7/12, grid.unit * 3 / 4);
        ctx.fill();

        // Root of the tail
        ctx.beginPath();
        ctx.moveTo(-grid.unit/6, grid.unit * 13/48);
        ctx.quadraticCurveTo(-grid.unit*4/24, grid.unit*7/16, 0, grid.unit*23/48);
        ctx.lineTo(grid.unit/24, grid.unit*19/48);
        ctx.fill();
        // Tip of the tail
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(grid.unit/4, grid.unit * 19/48);
        ctx.quadraticCurveTo(grid.unit/8, grid.unit*25/48, 0, grid.unit*23/48);
        ctx.lineTo(grid.unit/24, grid.unit*19/48);
        ctx.quadraticCurveTo(grid.unit*3/24, grid.unit*21/48, grid.unit/4, grid.unit * 19/48);
        ctx.fill();

        // Head
        ctx.fillStyle = constants.COLOURS.NPC.ENEMY[0];
        ctx.drawEllipse(0, -grid.unit * 7 / 48, grid.unit / 3, grid.unit / 2);
        ctx.fill();
        // Snout
        ctx.beginPath();
        ctx.moveTo(-grid.unit / 12, -grid.unit * 17 / 48);
        ctx.quadraticCurveTo(0, -grid.unit * 31/48, grid.unit / 12, -grid.unit * 17/48);
        ctx.lineTo(-grid.unit / 12, -grid.unit * 17 / 48);
        ctx.fill();
        ctx.fillStyle = constants.COLOURS.NPC.ENEMY[2];

        // Ears
        ctx.beginPath();
        ctx.moveTo(-grid.unit/6, -grid.unit/48);
        ctx.lineTo(-grid.unit/12, -grid.unit*9/48);
        ctx.lineTo(-grid.unit/24, -grid.unit/48);
        ctx.fill();
        ctx.moveTo(grid.unit/6, -grid.unit/48);
        ctx.lineTo(grid.unit/12, -grid.unit*9/48);
        ctx.lineTo(grid.unit/24, -grid.unit/48);
        ctx.fill();

    });

    var DYING_ANIM_LENGTH = 1000;

    function drawCritter(critter, exactTime) {
        if (!critter.inPlay) {
            return;
        }

        var deltaT = exactTime - critter.lastUpdate;

        if (critter.isAlive) {
            var directionVector = directionUtils.components(critter.direction);

            common.render(
                critter.x + deltaT * directionVector.x * critter.type.speed,
                critter.y + deltaT * directionVector.y * critter.type.speed,
                critter.direction, views[critter.type.name]);
        } else if (deltaT < DYING_ANIM_LENGTH) {
            grid.context.save();
            grid.context.globalAlpha = (DYING_ANIM_LENGTH - deltaT) / DYING_ANIM_LENGTH;

            common.render(
                critter.x + Math.sin(deltaT * 3 * Math.PI / DYING_ANIM_LENGTH) / 10,
                critter.y - deltaT * 0.0025,
                critter.direction, views[critter.type.name]);

            grid.context.restore();
        }
    }

    return {
        drawCritter: drawCritter
    };
};