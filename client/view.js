exports.build = function build(parent, model) {
    var constants = require('./graphics/constants.js');

    var stage = new PIXI.Stage(constants.COLOURS.BACKGROUND);

    var renderer = PIXI.autoDetectRenderer(model.width * constants.CELL_SIZE, model.height * constants.CELL_SIZE);
    parent.appendChild(renderer.view);

    var grid = require('./graphics/grid.js')(model);
    var fixtures = require('./graphics/fixtures.js')(grid);

    stage.addChild(grid);
    var isRunning = true;

    window.requestAnimationFrame(animate);

    function animate() {
        if (!isRunning) {
            return;
        }

        while (grid.children.length) {
            grid.removeChild(grid.getChildAt(0));
        }

        $.each(model.playerArrows, function(player, playerArrows) {
            $.each(playerArrows, function(i, arrow) {
                fixtures.drawArrow(player, arrow.x, arrow.y, arrow.d);
            });
        });

        model.sources.forEach(function(source) {
            fixtures.drawSource(source);
        });

        model.sinks.forEach(function(sink) {
            fixtures.drawSink(sink);
        });

        renderer.render(stage);
        window.requestAnimationFrame(animate);
    }

    var $arena = $(renderer.view);
    var clickCallback;

    $arena.mousedown(function(event) {
        if (!clickCallback) {
            return;
        }

        var offset = $arena.offset();
        var cell = {};

        cell.x = Math.floor((event.pageX - offset.left) / constants.CELL_SIZE);
        cell.y = Math.floor((event.pageY - offset.top) / constants.CELL_SIZE);

        clickCallback(cell);
    });

    function close() {
        isRunning = false;
        parent.removeChild(renderer.view);
    }

    return {
        click: function(callback) { clickCallback = callback },
        close: close
    }
};