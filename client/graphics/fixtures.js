module.exports = function(grid) {
    var constants = require('./constants.js');
    var common = require('./common.js')(grid);

    function shadeCell3d(graphics, convex) {
        var light = 0xFFFFFF;
        var shade = 0x000000;

        graphics.beginFill(convex ? light : shade, 0.2);
        graphics.moveTo(0, 0);
        graphics.lineTo(constants.CELL_SIZE, 0);
        graphics.lineTo(constants.CELL_SIZE, constants.CELL_SIZE);
        graphics.lineTo(0, 0);
        graphics.endFill();
        graphics.beginFill(convex ? shade : light, 0.2);
        graphics.moveTo(0, 0);
        graphics.lineTo(0, constants.CELL_SIZE);
        graphics.lineTo(constants.CELL_SIZE, constants.CELL_SIZE);
        graphics.lineTo(0, 0);
        graphics.endFill();
        graphics.lineStyle(1, convex ? light : shade, 0.2);
        graphics.moveTo(constants.CELL_SIZE, 0);
        graphics.lineTo(constants.CELL_SIZE / 2, constants.CELL_SIZE / 2);
        graphics.lineStyle(1, convex ? shade : light, 0.2);
        graphics.moveTo(0, constants.CELL_SIZE);
        graphics.lineTo(constants.CELL_SIZE / 2, constants.CELL_SIZE / 2);
        graphics.lineStyle();
    }

    function drawArrow(player, arrow) {
        return common.drawObject(function(graphics) {
            graphics.beginFill(constants.COLOURS.ARROW);
            graphics.moveTo(23.5, 7.5);
            graphics.lineTo(39.5, 23.5);
            graphics.lineTo(31.5, 23.5);
            graphics.lineTo(31.5, 39.5);
            graphics.lineTo(15.5, 40.5);
            graphics.lineTo(15.5, 23.5);
            graphics.lineTo(7.5, 23.5);
            graphics.lineTo(23.5, 7.5);
            graphics.endFill();
        }, arrow.x, arrow.y, constants.COLOURS.PLAYER[player], arrow.confirmed ? 0.6 : 0.2, arrow.d);
    }

    function drawSource(source) {
        common.drawObject(function(graphics) {
            shadeCell3d(graphics, true);
        }, source.x, source.y, constants.COLOURS.NPC.FRIENDLY[0], 1, 0);
        common.drawObject(function(graphics) {
            graphics.beginFill(constants.COLOURS.CELL[2], 1);
            graphics.moveTo(constants.CELL_SIZE / 6, 0);
            graphics.lineTo(constants.CELL_SIZE * 5 / 6, 0);
            graphics.lineTo(constants.CELL_SIZE * 2 / 3, constants.CELL_SIZE / 6);
            graphics.lineTo(constants.CELL_SIZE / 3, constants.CELL_SIZE / 6);
            graphics.lineTo(constants.CELL_SIZE / 6, 0);
            graphics.beginFill(constants.COLOURS.NPC.FRIENDLY[0], 1);
            graphics.drawRect(constants.CELL_SIZE / 4, constants.CELL_SIZE / 4,
                constants.CELL_SIZE / 2, constants.CELL_SIZE / 2);
        }, source.x, source.y, null, null, source.direction);
    }

    function drawSink(sink) {
        if (sink.player !== null) {
            common.drawObject(function(graphics) {
                graphics.lineStyle(4, 0xFFFFFF, 0.5);
                graphics.beginFill(constants.COLOURS.PLAYER[sink.player], 1);
                graphics.drawCircle(constants.CELL_SIZE / 2, constants.CELL_SIZE / 2, constants.CELL_SIZE / 3);
                graphics.endFill();
                graphics.lineStyle();
            }, sink.x, sink.y);
        } else {
            common.drawObject(function (graphics) {
                shadeCell3d(graphics, false);
                graphics.beginFill(constants.COLOURS.BACKGROUND, 1);
                graphics.drawRect(constants.CELL_SIZE / 12, constants.CELL_SIZE / 12,
                    constants.CELL_SIZE * 5 / 6, constants.CELL_SIZE * 5 / 6);
            }, sink.x, sink.y, constants.COLOURS.CELL[1], 1);
        }
    }

    return {
        drawArrow: drawArrow,
        drawSource: drawSource,
        drawSink: drawSink
    }
};