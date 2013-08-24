var game = game || {};

game.view = function(model) {

    var CELL_SIZE = 48;

    var CELL_COLOURS = [0xEEEEEE, 0xCCCCCC];
    var ARROW_COLOUR = 0xFFFFFF;
    var PLAYER_COLOURS = [0x0066FF, 0x00CC33];

    var stage = new PIXI.Stage(0x000000);

    var renderer = PIXI.autoDetectRenderer(model.width * CELL_SIZE, model.height * CELL_SIZE);
    document.body.appendChild(renderer.view);

    var grid = new PIXI.Graphics();

    function redrawGrid() {
        var cellFill = 0;
        for (var i = 0; i < model.width; ++i) {
            for (var j = 0; j < model.height; ++j) {
                var cellOriginX = i * CELL_SIZE;
                var cellOriginY = j * CELL_SIZE;

                grid.beginFill(CELL_COLOURS[cellFill], 1);
                grid.drawRect(cellOriginX, cellOriginY, CELL_SIZE, CELL_SIZE);

                if (model.isActive(i,j)) {
                    grid.beginFill(PLAYER_COLOURS[0], 0.6);
                    grid.drawRect(cellOriginX, cellOriginY, CELL_SIZE, CELL_SIZE);

                    grid.beginFill(ARROW_COLOUR, 1);
                    grid.moveTo(cellOriginX + 8, cellOriginY + 24);
                    grid.lineTo(cellOriginX + 24, cellOriginY + 8);
                    grid.lineTo(cellOriginX + 40, cellOriginY + 24);
                    grid.lineTo(cellOriginX + 32, cellOriginY + 24);
                    grid.lineTo(cellOriginX + 32, cellOriginY + 40);
                    grid.lineTo(cellOriginX + 16, cellOriginY + 40);
                    grid.lineTo(cellOriginX + 16, cellOriginY + 24);
                    grid.lineTo(cellOriginX + 8, cellOriginY + 24);
                    grid.endFill();
                }

                cellFill = 1-cellFill;
            }
            cellFill = 1-cellFill;
        }
    }

    stage.addChild(grid);

    requestAnimFrame(animate);

    function animate() {
        grid.clear();
        redrawGrid();
        renderer.render(stage);
        requestAnimFrame(animate);
    }

    var $arena = $(renderer.view);

    $arena.click(function(event) {
        if (!clickCallback) {
            return;
        }

        var offset = $arena.offset();

        var cell = {};
        cell.x = Math.floor((event.pageX - offset.left) / CELL_SIZE);
        cell.y = Math.floor((event.pageY - offset.top) / CELL_SIZE);
        clickCallback(cell);
    });

    return {
        click: function(callback) { clickCallback = callback }
    }
};

