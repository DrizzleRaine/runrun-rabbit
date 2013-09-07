'use strict';

/*
 http://diveintohtml5.info/canvas.html
 http://www.ibm.com/developerworks/library/wa-canvashtml5layering/
 https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial?redirectlocale=en-US&redirectslug=Canvas_tutorial
 https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Transformations
 http://www.html5rocks.com/en/tutorials/canvas/performance/
 */

module.exports = function(grid) {
    var unit = require('./constants.js').CELL_SIZE;

    CanvasRenderingContext2D.prototype.drawCircle = function (x, y, radius) {
        this.beginPath();
        this.arc(x, y, radius, 0, Math.PI * 2, false);
    };

    CanvasRenderingContext2D.prototype.drawEllipse = function (centreX, centreY, width, height) {
        // See http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
        var offset = .551784,
            offsetX = (width / 2) * offset,
            offsetY = (height / 2) * offset,
            x = centreX - (width / 2),
            y = centreY - (width / 2),
            endX = x + width,
            endY = y + height,
            midX = x + width / 2,
            midY = y + height / 2;

        this.beginPath();
        this.moveTo(x, midY);
        this.bezierCurveTo(x, midY - offsetY, midX - offsetX, y, midX, y);
        this.bezierCurveTo(midX + offsetX, y, endX, midY - offsetY, endX, midY);
        this.bezierCurveTo(endX, midY + offsetY, midX + offsetX, endY, midX, endY);
        this.bezierCurveTo(midX - offsetX, endY, x, midY + offsetY, x, midY);
    };

    function preRender(drawDetail, cellSize) {
        cellSize = cellSize || unit;
        var cell = document.createElement('canvas');
        cell.width = cellSize;
        cell.height = cellSize;
        var ctx = cell.getContext('2d');
        ctx.translate(cellSize / 2, cellSize / 2);
        drawDetail(ctx);
        return function(ctx) {
            ctx.drawImage(cell, -cellSize / 2, -cellSize / 2);
        };
    }

    function renderStatic(x, y, background) {
        return render(x, y, null, null, background);
    }

    function render(x, y, direction, foreground, background) {
        grid.context.save();
        grid.context.translate((unit * x) + (unit / 2), (unit * y) + (unit / 2));
        if (background) {
            grid.context.save();
            background(grid.context);
            grid.context.restore();
        }
        if (foreground) {
            grid.context.rotate(direction * Math.PI / 2);
            foreground(grid.context);
        }
        grid.context.restore();
    }

    return {
        preRender: preRender,
        render: render,
        renderStatic: renderStatic
    };
};