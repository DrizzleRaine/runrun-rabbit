'use strict';

var paths = require('./paths.js');
var sprites = require('../sprites.js');
var directionUtils = require('../utils/direction.js');

var Bot = module.exports.Bot = function Bot(playerId) {
    this.playerId = playerId;
};

// Note: If this is set less than the time taken for a critter to cross a square, then
// the behaviour of the fox and rabbit path placement may be odd, as arrows are placed
// based on where the critter is going to be, so have to be left untouched for a while
var UPDATE_INTERVAL = 500;

var MAX_ARROWS = require('../arrows.js').MAX_ARROWS;
Bot.prototype.implementPath = function implementPath(chosenPath) {
    chosenPath.arrows.forEach(function (arrow) {
        this.model.addArrow(this.playerId, arrow);
    }.bind(this));
};

Bot.prototype.update = function update() {
    if (!this.model.isRunning) {
        return;
    }

    var bestPaths =
        findFoxPaths(this.model, this.pathFinder, this.playerId)
            .concat(findSourcePaths(this.model, this.pathFinder, this.playerId));

    var totalArrows = 0;
    var chosenPath;
    while (totalArrows < MAX_ARROWS && (chosenPath = bestPaths.shift())) {
        totalArrows += chosenPath.arrows.length;
        this.implementPath(chosenPath);
    }

    setTimeout(this.update.bind(this), UPDATE_INTERVAL);
};

Bot.prototype.start = function startBot(model) {
    this.model = model;
    this.pathFinder = new paths.Finder(this.model, this.playerId);
    setTimeout(this.update.bind(this), UPDATE_INTERVAL * this.playerId / model.totalPlayers);
};

function findSourcePaths(model, finder, playerId) {
    var bestPaths = [];

    model.level.sources.forEach(function(source) {
        var path = finder.findBestPath({
            x: source.x,
            y: source.y,
            d: source.direction,
            g: 0
        }, playerId);
        if (path) {
            bestPaths.push(path);
        }
    });

    return bestPaths.sort(comparePaths);
}

function findFoxPaths(model, finder, playerId) {
    var bestPaths = [];

    var targetPlayerId = (playerId + 1) % model.totalPlayers;

    if (model.totalPlayers > 2) {
        var targetPlayerScore = 0;

        model.playerScores.current.forEach(function (score, playerId) {
            if (playerId !== playerId && score > targetPlayerScore) {
                targetPlayerScore = score;
                targetPlayerId = playerId;
            }
        });
    }

    model.critters.forEach(function (critter) {
        if (critter.type === sprites.FOX && critter.inPlay) {
            var direction = directionUtils.components(critter.direction);
            var path = finder.findBestPath({
                x: Math.ceil(critter.x + direction.x),
                y: Math.ceil(critter.y + direction.y),
                d: critter.direction,
                g: 0
            }, targetPlayerId);
            if (path) {
                bestPaths.push(path);
            }
        }
    });

    return bestPaths.sort(comparePaths);
}

var comparePaths = function (a, b) {
    return a.cost - b.cost;
};