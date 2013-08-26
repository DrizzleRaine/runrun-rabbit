var levels = require('./levels.js');

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

    var level = levels[1];

    function addArrow(player, arrow) {
        for (var p = 0; p < playerArrows.length; ++p) {
            if (getAtCell(playerArrows[p], arrow.x, arrow.y)) {
                return;
            }
        }

        var ownArrows = playerArrows[player];
        if (ownArrows.length === MAX_ARROWS) {
            ownArrows.shift();
        }

        ownArrows.push(arrow);
    }

    function getSource(x, y) {
        return getAtCell(level.sources, x, y);
    }

    function getSink(x, y) {
        return getAtCell(level.sinks, x, y);
    }

    function getAtCell(objects, x, y) {
        for (var i = 0; i < objects.length; ++i) {
            if (objects[i].x === x && objects[i].y === y) {
                return objects[i];
            }
        }
        return null;
    }

    return {
        addArrow: addArrow,
        playerArrows: playerArrows,
        getSource: getSource,
        getSink: getSink,
        sinks: level.sinks,
        sources: level.sources,
        width: WIDTH,
        height: HEIGHT
    }
};