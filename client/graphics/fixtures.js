module.exports = function(grid) {
    var constants = require('./constants.js');

    function cell3d(graphics, originX, originY, convex) {
        var light = 0xFFFFFF;
        var shade = 0x000000;

        graphics.beginFill(convex ? light : shade, 0.2);
        graphics.moveTo(originX, originY);
        graphics.lineTo(originX + constants.CELL_SIZE, originY);
        graphics.lineTo(originX + constants.CELL_SIZE, originY + constants.CELL_SIZE);
        graphics.lineTo(originX, originY);
        graphics.endFill();
        graphics.beginFill(convex ? shade : light, 0.2);
        graphics.moveTo(originX, originY);
        graphics.lineTo(originX, originY + constants.CELL_SIZE);
        graphics.lineTo(originX + constants.CELL_SIZE, originY + constants.CELL_SIZE);
        graphics.lineTo(originX, originY);
        graphics.endFill();
        graphics.lineStyle(1, convex ? light : shade, 0.2);
        graphics.moveTo(originX + constants.CELL_SIZE, originY);
        graphics.lineTo(originX + constants.CELL_SIZE / 2, originY + constants.CELL_SIZE / 2);
        graphics.lineStyle(1, convex ? shade : light, 0.2);
        graphics.moveTo(originX, originY + constants.CELL_SIZE);
        graphics.lineTo(originX + constants.CELL_SIZE / 2, originY + constants.CELL_SIZE / 2);
        graphics.lineStyle();
    }

    function drawIcon(drawInner, i, j, background, alpha, direction, scale) {
        var icon = new PIXI.Graphics();

        icon.position.x = i * constants.CELL_SIZE + constants.CELL_SIZE / 2;
        icon.position.y = j * constants.CELL_SIZE + constants.CELL_SIZE / 2;
        icon.pivot.x = constants.CELL_SIZE / 2;
        icon.pivot.y = constants.CELL_SIZE / 2;

        if (background !== null && typeof(background) != 'undefined') {
            icon.beginFill(background, alpha);
            icon.drawRect(0, 0, constants.CELL_SIZE, constants.CELL_SIZE);
        }

        drawInner(icon);

        grid.addChild(icon);

        if (direction) {
            icon.rotation = (direction || 0) * Math.PI / 2;
        }
        if (scale) {
            icon.scale.x = scale;
            icon.scale.y = scale;
        }

        return icon;
    }

    function drawArrow(player, i, j, direction) {
        return drawIcon(function(arrow) {
            arrow.beginFill(constants.COLOURS.ARROW);
            arrow.moveTo(23.5, 7.5);
            arrow.lineTo(39.5, 23.5);
            arrow.lineTo(31.5, 23.5);
            arrow.lineTo(31.5, 39.5);
            arrow.lineTo(15.5, 40.5);
            arrow.lineTo(15.5, 23.5);
            arrow.lineTo(7.5, 23.5);
            arrow.lineTo(23.5, 7.5);
            arrow.endFill();
        }, i, j, constants.COLOURS.PLAYER[player], 0.6, direction);
    }

    function drawSource(source) {
        drawIcon(function(icon) {
            cell3d(icon, 0, 0, true);
        }, source.x, source.y, constants.COLOURS.NPC.FRIENDLY, 1, 0);
        drawIcon(function(icon) {
            icon.beginFill(constants.COLOURS.CELL[2], 1);
            icon.moveTo(constants.CELL_SIZE / 6, 0);
            icon.lineTo(constants.CELL_SIZE * 5 / 6, 0);
            icon.lineTo(constants.CELL_SIZE * 2 / 3, constants.CELL_SIZE / 6);
            icon.lineTo(constants.CELL_SIZE / 3, constants.CELL_SIZE / 6);
            icon.lineTo(constants.CELL_SIZE / 6, 0);
            icon.beginFill(constants.COLOURS.NPC.FRIENDLY, 1);
            icon.drawRect(constants.CELL_SIZE / 4, constants.CELL_SIZE / 4, constants.CELL_SIZE / 2, constants.CELL_SIZE / 2);
        }, source.x, source.y, null, null, source.direction);
    }

    function drawSink(sink) {
        if (sink.player !== null) {
            drawIcon(function(icon) {
                icon.lineStyle(4, 0xFFFFFF, 0.5);
                icon.beginFill(constants.COLOURS.PLAYER[sink.player], 1);
                icon.drawCircle(constants.CELL_SIZE / 2, constants.CELL_SIZE / 2, constants.CELL_SIZE / 3);
                icon.endFill();
                icon.lineStyle();
            }, sink.x, sink.y);
        } else {
            drawIcon(function (icon) {
                cell3d(icon, 0, 0, false);
                icon.beginFill(constants.COLOURS.BACKGROUND, 1);
                icon.drawRect(constants.CELL_SIZE / 12, constants.CELL_SIZE / 12,
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