var game = game || {};

game.model = function() {
    var WIDTH = 12;
    var HEIGHT = 10;
    var PLAYERS = 2;
    var MAX_ARROWS = 3;

    function initialise2d(size) {
        var arr = [];
        for (var i = 0; i < size; ++i) {
            arr[i] = [];
        }
        return arr;
    }

    var playerArrows = initialise2d(PLAYERS);

    var addArrow = function(player, cell, direction) {
        var active = playerArrows[player];
        for (var i = 0; i < active.length; ++i) {
            if (active[i].x === cell.x && active[i].y === cell.y) {
                return;
            }
        }

        if (active.length === MAX_ARROWS) {
            active.shift();
        }

        active.push({
            x: cell.x,
            y: cell.y,
            d: direction
        });
    };

    return {
        addArrow: addArrow,
        playerArrows: playerArrows,
        width: WIDTH,
        height: HEIGHT
    }
};