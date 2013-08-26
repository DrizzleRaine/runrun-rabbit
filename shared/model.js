var levels = require('./levels.js');

exports.build = function build(level) {
    var model = {};

    var gridUtils = require('./utils/grid.js');
    var arrayUtils = require('./utils/array.js');
    var sprites = require('./sprites.js');

    var PLAYERS = 2;
    var MAX_ARROWS = 3;
    var playerArrows = arrayUtils.initialise(PLAYERS, function() { return []; });
    var playerScores = arrayUtils.initialise(PLAYERS, 0);

    function addArrow(player, arrow) {
        if (getArrow(arrow.x, arrow.y)) {
            return false;
        }

        var ownArrows = playerArrows[player];
        if (ownArrows.length === MAX_ARROWS) {
            ownArrows.shift();
        }

        ownArrows.push(arrow);
        return true;
    }

    function getArrow(i, j) {
        for (var p = 0; p < playerArrows.length; ++p) {
            var arrow = gridUtils.getAtCell(playerArrows[p], i, j);
            if (arrow) {
                return arrow;
            }
        }
        return null;
    }

    var critters = [];

    function rewardPlayer(player, score) {
        playerScores[player] += score;
    }

    var lastUpdate = new Date().getTime();
    var TICK = 1000;

    function update() {
        var now = new Date().getTime();
        var delta = now - lastUpdate;
        /*if (delta > 1000) {
            throw new Error("Lagged out");
        }*/

        var remainingCritters = [];
        while (critters.length) {
            var critter = critters.pop();
            critter.update(model, delta);
            if (critter.inPlay) {
                remainingCritters.push(critter);
            }
        }
        while (remainingCritters.length) {
            critters.push(remainingCritters.pop());
        }

        if (Math.floor(now / TICK) > Math.floor(lastUpdate / TICK)) {
            level.sources.forEach(function(source) {
                critters.push(new sprites.Critter(source));
            });
        }

        lastUpdate = now;
    }

    model.width = level.width;
    model.height = level.height;
    model.sources = level.sources;
    model.sinks = level.sinks;
    model.critters = critters;
    model.playerArrows = playerArrows;
    model.update = update;
    model.addArrow = addArrow;
    model.getArrow = getArrow;
    model.rewardPlayer = rewardPlayer;

    return model;
};