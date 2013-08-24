var game = game || {};

game.view = function(parent, model) {

    var CELL_SIZE = 48;

    var CELL_COLOURS = [0xEEEEEE, 0xCCCCCC];
    var ARROW_COLOUR = 0xFFFFFF;
    var PLAYER_COLOURS = [0x0066FF, 0x00CC33];

    var stage = new PIXI.Stage(0x000000);

    var renderer = PIXI.autoDetectRenderer(model.width * CELL_SIZE, model.height * CELL_SIZE);
    parent.appendChild(renderer.view);

    var grid = new PIXI.Graphics();

    var cellFill = 0;
    for (var i = 0; i < model.width; ++i) {
        for (var j = 0; j < model.height; ++j) {
            var cellOriginX = i * CELL_SIZE;
            var cellOriginY = j * CELL_SIZE;

            grid.beginFill(CELL_COLOURS[cellFill], 1);
            grid.drawRect(cellOriginX, cellOriginY, CELL_SIZE, CELL_SIZE);

            cellFill = 1-cellFill;
        }
        cellFill = 1-cellFill;
    }

    function drawArrow(player, i, j, direction) {
        var arrow = new PIXI.Graphics();

        arrow.position.x = i * CELL_SIZE + CELL_SIZE / 2;
        arrow.position.y = j * CELL_SIZE + CELL_SIZE / 2;
        arrow.pivot.x = CELL_SIZE / 2;
        arrow.pivot.y = CELL_SIZE / 2;

        arrow.beginFill(PLAYER_COLOURS[player], 0.6);
        arrow.drawRect(0, 0, CELL_SIZE, CELL_SIZE);

        arrow.beginFill(ARROW_COLOUR, 1);
        arrow.moveTo(23.5, 7.5);
        arrow.lineTo(39.5, 23.5);
        arrow.lineTo(31.5, 23.5);
        arrow.lineTo(31.5, 39.5);
        arrow.lineTo(15.5, 40.5);
        arrow.lineTo(15.5, 23.5);
        arrow.lineTo(7.5, 23.5);
        arrow.lineTo(23.5, 7.5);
        arrow.endFill();

        grid.addChild(arrow);

        arrow.rotation = (direction || 0) * Math.PI / 2;

        return arrow;
    }

    stage.addChild(grid);

    var isRunning = true;
    requestAnimFrame(animate);

    function animate() {
        if (!isRunning) {
            return;
        }

        while (grid.children.length) {
            grid.removeChild(grid.getChildAt(0));
        }

        $.each(model.playerArrows, function(player, playerArrows) {
            $.each(playerArrows, function(i, arrow) {
                drawArrow(player, arrow.x, arrow.y, arrow.d);
            });
        });

        renderer.render(stage);
        requestAnimFrame(animate);
    }

    var $arena = $(renderer.view);
    var clickCallback;

    $arena.mousedown(function(event) {
        if (!clickCallback) {
            return;
        }

        var offset = $arena.offset();
        var cell = {};
        cell.x = Math.floor((event.pageX - offset.left) / CELL_SIZE);

        cell.y = Math.floor((event.pageY - offset.top) / CELL_SIZE);

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

