'use strict';

module.exports = function(grid) {
    var constants = require('./constants.js');
    var common = require('./common.js')(grid);
    var sprites = require('../../shared/sprites.js');

    function drawRabbit(critter) {
        common.drawObject(function(graphics, unit) {
            graphics.beginFill(constants.COLOURS.NPC.FRIENDLY[0]);
            graphics.drawElipse(unit / 2, unit / 2, unit * 11 / 48, unit / 4);
            graphics.beginFill(constants.COLOURS.NPC.FRIENDLY[1]);
            graphics.drawCircle(unit / 2, unit * 5 / 12, unit / 6);
            graphics.drawElipse(unit * 5 / 12, unit / 4, unit / 16, unit / 8);
            graphics.drawElipse(unit * 7 / 12, unit / 4, unit / 16, unit / 8);
            graphics.beginFill(0xFFFFFF);
            graphics.drawCircle(unit / 2, unit * 3 / 4, unit / 12);
            graphics.endFill();
        }, critter.x, critter.y, null, null, critter.direction);
    }

    function drawFox(critter) {
        common.drawObject(function(graphics, unit) {
            graphics.beginFill(constants.COLOURS.NPC.ENEMY[1]);
            graphics.drawElipse(unit / 2, unit / 2, unit / 6, unit / 3);
            graphics.moveTo(unit / 2, unit * 7 / 6);
            graphics.lineTo(unit * 3 / 8, unit * 2 / 3);
            graphics.lineTo(unit * 5 / 8, unit * 2 / 3);
            graphics.lineTo(unit / 2, unit * 7 / 6);
            graphics.beginFill(constants.COLOURS.NPC.ENEMY[0]);
            graphics.moveTo(unit / 2, -unit / 6);
            graphics.lineTo(unit * 17 / 24, unit * 9 / 24);
            graphics.lineTo(unit * 7 / 24, unit * 9 / 24);
            graphics.lineTo(unit / 2, -unit / 6);
            graphics.beginFill(0xFFFFFF);
            graphics.moveTo(unit / 2, unit * 7 / 6);
            graphics.lineTo(unit * 7 / 16, unit * 11 / 12);
            graphics.lineTo(unit * 9 / 16, unit * 11 / 12);
            graphics.lineTo(unit / 2, unit * 7 / 6);
            graphics.endFill();
        }, critter.x, critter.y, null, null, critter.direction);
    }

    function drawCritter(critter) {
        switch (critter.type) {
        case sprites.RABBIT:
            drawRabbit(critter);
            break;
        case sprites.FOX:
            drawFox(critter);
            break;
        }
    }

    return {
        drawCritter: drawCritter
    };
};