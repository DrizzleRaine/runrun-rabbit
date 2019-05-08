'use strict';

module.exports = function initFixtures(grid) {
    var constants = require('./constants.js');
    var common = require('./common.js')(grid);
    var visualStyle = 'standard';

    function squareArrow(ctx) {
        ctx.fillRect(-grid.unit / 2, -grid.unit / 2, grid.unit, grid.unit);
    }

    function circleArrow(ctx) {
        ctx.drawCircle(0, 0, grid.unit / 2);
        ctx.fill();
    }

    function squareSink(ctx) {
        ctx.beginPath();
        ctx.moveTo(-grid.unit / 6, -grid.unit / 3);
        ctx.lineTo(grid.unit / 6, -grid.unit / 3);
        ctx.arc(grid.unit /6, -grid.unit / 6, grid.unit / 6, Math.PI * 3 / 2, 0);
        ctx.lineTo(grid.unit / 3, grid.unit / 6);
        ctx.arc(grid.unit /6, grid.unit / 6, grid.unit / 6, 0, Math.PI / 2);
        ctx.lineTo(-grid.unit / 6, grid.unit / 3);
        ctx.arc(-grid.unit /6, grid.unit / 6, grid.unit / 6, Math.PI / 2, Math.PI);
        ctx.lineTo(-grid.unit / 3, -grid.unit / 6);
        ctx.arc(-grid.unit /6, -grid.unit / 6, grid.unit / 6, Math.PI, Math.PI * 3 / 2);
    }

    function circleSink(ctx) {
        ctx.drawCircle(0, 0, grid.unit/3);
    }

    var shapes = {
        playerArrows: {
            'standard': [squareArrow, squareArrow, squareArrow, squareArrow],
            'redGreen': [squareArrow, squareArrow, circleArrow, circleArrow],
            'blueYellow': [squareArrow, circleArrow, squareArrow, circleArrow]
        },
        playerSinks: {
            'standard': [circleSink, circleSink, circleSink, circleSink],
            'redGreen': [squareSink, squareSink, circleSink, circleSink],
            'blueYellow': [squareSink, circleSink, squareSink, circleSink]
        }
    };

    function shadeCell3d(ctx, convex) {
        var light = '#FFFFFF';
        var shade = '#000000';

        ctx.globalAlpha = 0.2;
        ctx.fillStyle = convex ? light : shade;
        ctx.beginPath();
        ctx.moveTo(-grid.unit/2, -grid.unit/2);
        ctx.lineTo(grid.unit/2, -grid.unit/2);
        ctx.lineTo(grid.unit/2, grid.unit/2);
        ctx.lineTo(-grid.unit/2, -grid.unit/2);
        ctx.fill();
        ctx.fillStyle = convex ? shade : light;
        ctx.beginPath();
        ctx.moveTo(-grid.unit/2, -grid.unit/2);
        ctx.lineTo(-grid.unit/2, grid.unit/2);
        ctx.lineTo(grid.unit/2, grid.unit/2);
        ctx.lineTo(-grid.unit/2, -grid.unit/2);
        ctx.fill();
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = convex ? light : shade;
        ctx.beginPath();
        ctx.moveTo(grid.unit/2, -grid.unit/2);
        ctx.lineTo(0, 0);
        ctx.stroke();
        ctx.closePath();
        ctx.strokeStyle = convex ? shade : light;
        ctx.beginPath();
        ctx.moveTo(-grid.unit/2, grid.unit/2);
        ctx.lineTo(0, 0);
        ctx.stroke();
        ctx.closePath();
    }

    var arrowForeground = common.preRender(function (ctx) {
        ctx.fillStyle = constants.COLOURS.ARROW;
        ctx.beginPath();
        ctx.moveTo(0, -grid.unit / 3);
        ctx.lineTo(grid.unit / 3, 0);
        ctx.lineTo(grid.unit / 6, 0);
        ctx.lineTo(grid.unit / 6, grid.unit / 3);
        ctx.lineTo(-grid.unit / 6, grid.unit / 3);
        ctx.lineTo(-grid.unit / 6, 0);
        ctx.lineTo(-grid.unit / 3, 0);
        ctx.lineTo(0, -grid.unit / 3);
        ctx.fill();
    });

    function drawArrow(player, arrow, gameTime) {
        common.render(arrow.x, arrow.y, arrow.direction, arrowForeground,
        function(ctx) {
            ctx.globalAlpha = gameTime + 500 > arrow.to ? 0.2 : 0.6;
            ctx.fillStyle = constants.COLOURS.PLAYER[player];
            shapes.playerArrows[visualStyle][player](ctx);
        }, 1 - arrow.hits.length * 0.3);
    }

    var sourceBackground = common.preRender(function(ctx) {
        ctx.fillStyle = constants.COLOURS.NPC.FRIENDLY[0];
        ctx.fillRect(-grid.unit/2, -grid.unit/2, grid.unit, grid.unit);
        shadeCell3d(ctx, true);
    });
    var sourceForeground = common.preRender(function(ctx) {
        ctx.fillStyle = constants.COLOURS.CELL[2];
        ctx.moveTo(-grid.unit/3, -grid.unit/2);
        ctx.lineTo(grid.unit/3, -grid.unit/2);
        ctx.lineTo(grid.unit/6, -grid.unit/3);
        ctx.lineTo(-grid.unit/6, -grid.unit/3);
        ctx.lineTo(-grid.unit/3, -grid.unit/2);
        ctx.fill();
        ctx.fillStyle = constants.COLOURS.NPC.FRIENDLY[0];
        ctx.fillRect(-grid.unit/4, -grid.unit/4, grid.unit / 2, grid.unit / 2);
    });

    function drawSource(source) {
        common.render(source.x, source.y, source.direction, sourceForeground, sourceBackground);
    }

    var renderedSink = common.preRender(function(ctx) {
        ctx.fillStyle = constants.COLOURS.CELL[1];
        ctx.fillRect(-grid.unit/2, -grid.unit/2, grid.unit, grid.unit);
        shadeCell3d(ctx, false);
        ctx.globalAlpha = 1;
        ctx.fillStyle = constants.COLOURS.BACKGROUND;
        ctx.fillRect(-grid.unit*5/12,-grid.unit*5/12,grid.unit*5/6,grid.unit*5/6);
    });

    function drawSink(sink) {
        common.renderStatic(sink.x, sink.y, function(ctx) {
            if (sink.player !== null) {
                shapes.playerSinks[visualStyle][sink.player](ctx);
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

    function setVisualStyle(value) {
        visualStyle = value;
    }

    return {
        drawArrow: drawArrow,
        drawSource: drawSource,
        drawSink: drawSink,
        setVisualStyle: setVisualStyle
    };
};