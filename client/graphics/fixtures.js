'use strict';

module.exports = function initFixtures(grid) {
    var constants = require('./constants.js');
    var common = require('./common.js')(grid);

    var unit = constants.CELL_SIZE;

    function shadeCell3d(ctx, convex) {
        var light = '#FFFFFF';
        var shade = '#000000';

        ctx.globalAlpha = 0.2;
        ctx.fillStyle = convex ? light : shade;
        ctx.beginPath();
        ctx.moveTo(-unit/2, -unit/2);
        ctx.lineTo(unit/2, -unit/2);
        ctx.lineTo(unit/2, unit/2);
        ctx.lineTo(-unit/2, -unit/2);
        ctx.fill();
        ctx.fillStyle = convex ? shade : light;
        ctx.beginPath();
        ctx.moveTo(-unit/2, -unit/2);
        ctx.lineTo(-unit/2, unit/2);
        ctx.lineTo(unit/2, unit/2);
        ctx.lineTo(-unit/2, -unit/2);
        ctx.fill();
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = convex ? light : shade;
        ctx.beginPath();
        ctx.moveTo(unit/2, -unit/2);
        ctx.lineTo(0, 0);
        ctx.stroke();
        ctx.closePath();
        ctx.strokeStyle = convex ? shade : light;
        ctx.beginPath();
        ctx.moveTo(-unit/2, unit/2);
        ctx.lineTo(0, 0);
        ctx.stroke();
        ctx.closePath();
    }

    var arrowForeground = common.preRender(function (ctx) {
        ctx.fillStyle = constants.COLOURS.ARROW;
        ctx.beginPath();
        ctx.moveTo(0, -unit / 3);
        ctx.lineTo(unit / 3, 0);
        ctx.lineTo(unit / 6, 0);
        ctx.lineTo(unit / 6, unit / 3);
        ctx.lineTo(-unit / 6, unit / 3);
        ctx.lineTo(-unit / 6, 0);
        ctx.lineTo(-unit / 3, 0);
        ctx.lineTo(0, -unit / 3);
        ctx.fill();
    });

    function drawArrow(player, arrow, gameTime) {
        common.render(arrow.x, arrow.y, arrow.direction, arrowForeground,
        function(ctx) {
            ctx.globalAlpha = gameTime + 500 > arrow.to ? 0.2 : 0.6;
            ctx.fillStyle = constants.COLOURS.PLAYER[player];
            ctx.fillRect(-unit / 2, -unit / 2, unit, unit);
        });
    }

    var sourceBackground = common.preRender(function(ctx) {
        ctx.fillStyle = constants.COLOURS.NPC.FRIENDLY[0];
        ctx.fillRect(-unit/2, -unit/2, unit, unit);
        shadeCell3d(ctx, true);
    });
    var sourceForeground = common.preRender(function(ctx) {
        ctx.fillStyle = constants.COLOURS.CELL[2];
        ctx.moveTo(-unit/3, -unit/2);
        ctx.lineTo(unit/3, -unit/2);
        ctx.lineTo(unit/6, -unit/3);
        ctx.lineTo(-unit/6, -unit/3);
        ctx.lineTo(-unit/3, -unit/2);
        ctx.fill();
        ctx.fillStyle = constants.COLOURS.NPC.FRIENDLY[0];
        ctx.fillRect(-unit/4, -unit/4, unit / 2, unit / 2);
    });

    function drawSource(source) {
        common.render(source.x, source.y, source.direction, sourceForeground, sourceBackground);
    }

    var renderedSink = common.preRender(function(ctx) {
        ctx.fillStyle = constants.COLOURS.CELL[1];
        ctx.fillRect(-unit/2, -unit/2, unit, unit);
        shadeCell3d(ctx, false);
        ctx.globalAlpha = 1;
        ctx.fillStyle = constants.COLOURS.BACKGROUND;
        ctx.fillRect(-unit*5/12,-unit*5/12,unit*5/6,unit*5/6);
    });

    function drawSink(sink) {
        common.renderStatic(sink.x, sink.y, function(ctx) {
            if (sink.player !== null) {
                ctx.drawCircle(0, 0, unit/3);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 4;
                ctx.globalAlpha = 0.5;
                ctx.stroke();
                ctx.globalAlpha = 1;
                ctx.fillStyle = constants.COLOURS.PLAYER[sink.player];
                ctx.fill();
            } else {
                renderedSink(ctx);
            }
        });
    }

    return {
        drawArrow: drawArrow,
        drawSource: drawSource,
        drawSink: drawSink
    };
};