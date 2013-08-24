exports.build = function build() {
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

    var addArrow = function(player, arrow) {
        for (var p = 0; p < playerArrows.length; ++p) {
            for (var a = 0; a < playerArrows[p].length; ++a) {
                if (playerArrows[p][a].x === arrow.x && playerArrows[p][a].y === arrow.y) {
                    return;
                }
            }
        }

        var ownArrows = playerArrows[player];
        if (ownArrows.length === MAX_ARROWS) {
            ownArrows.shift();
        }

        ownArrows.push(arrow);
    };

    return {
        addArrow: addArrow,
        playerArrows: playerArrows,
        width: WIDTH,
        height: HEIGHT
    }
};