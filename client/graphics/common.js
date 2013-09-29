'use strict';

/*
 http://diveintohtml5.info/canvas.html
 http://www.ibm.com/developerworks/library/wa-canvashtml5layering/
 https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial
 https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Transformations
 http://www.html5rocks.com/en/tutorials/canvas/performance/
 */

module.exports = function(grid) {
    CanvasRenderingContext2D.prototype.drawCircle = function (x, y, radius) {
        this.beginPath();
        this.arc(x, y, radius, 0, Math.PI * 2, false);
    };

    CanvasRenderingContext2D.prototype.drawEllipse = function (centreX, centreY, width, height) {
        // See http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
        var offset = 0.551784,
            offsetX = (width / 2) * offset,
            offsetY = (height / 2) * offset,
            x = centreX - (width / 2),
            y = centreY - (height / 2),
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

    function preRender(drawDetail) {
        var cell = document.createElement('canvas');
        cell.width = grid.unit;
        cell.height = grid.unit;
        var ctx = cell.getContext('2d');
        ctx.translate(grid.unit / 2, grid.unit / 2);
        drawDetail(ctx);
        return function preRenderSprite(ctx) {
            ctx.drawImage(cell, -grid.unit / 2, -grid.unit / 2);
        };
    }

    function renderStatic(x, y, background) {
        return render(x, y, null, null, background);
    }

    function render(x, y, direction, foreground, background, scale) {
        grid.context.save();
        grid.context.translate((grid.unit * x) + (grid.unit / 2), (grid.unit * y) + (grid.unit / 2));
        if (scale) {
            grid.context.scale(scale, scale);
        }
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