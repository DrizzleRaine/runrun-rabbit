var game = game || {};

game.model = function() {
    var WIDTH = 12;
    var HEIGHT = 10;

    var cells = [];
    for (var i = 0; i < WIDTH; ++i) {
        cells[i] = [];
    }

    var activeCells = [];

    var activate = function(cell) {
        if (isActive(cell.x, cell.y)) {
            return;
        }

        if (activeCells.length === 3) {
            var deactivate = activeCells.shift();
            cells[deactivate.x][deactivate.y] = false;
        }
        activeCells.push(cell);
        cells[cell.x][cell.y] = true;
    };

    var isActive = function(i, j) {
        return cells[i][j];
    };

    return {
        activate: activate,
        isActive: isActive,
        width: WIDTH,
        height: HEIGHT
    }
};