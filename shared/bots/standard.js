'use strict';

var paths = require('./paths.js');
var sprites = require('../sprites.js');
var directionUtils = require('../utils/direction.js');

var Bot = module.exports.Bot = function Bot(playerId) {
    this.playerId = playerId;
    this.arrows = [];
};

// Adjusting this affects the difficulty
//  - 500 is almost self-defeating
//  - 250 feels like a good human player
//  - 50 is inhumanly good
var UPDATE_INTERVAL = 250;

var MAX_ARROWS = require('../arrows.js').MAX_ARROWS;

Bot.prototype.update = function update() {
    if (!this.model.isRunning) {
        return;
    }

    if (this.arrows.length) {
        this.model.addArrow(this.playerId, this.arrows.shift());
        setTimeout(this.update.bind(this), UPDATE_INTERVAL);
        return;
    }

    var bestPaths =
        findFoxPaths(this.model, this.pathFinder, this.playerId)
            .concat(findSourcePaths(this.model, this.pathFinder, this.playerId));

    var chosenPath;
    var chooseArrow = function (arrow) {
        this.arrows.push(arrow);
    }.bind(this);
    while (this.arrows.length < MAX_ARROWS - 1 && (chosenPath = bestPaths.shift())) {
        chosenPath.arrows.forEach(chooseArrow);
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

function findFoxPaths(model, finder, ownPlayerId) {
    var bestPaths = [];

    var targetPlayerId = (ownPlayerId + 1) % model.totalPlayers;

    if (model.totalPlayers > 2) {
        var targetPlayerScore = 0;

        model.playerScores.current.forEach(function (score, playerId) {
            if (playerId !== ownPlayerId && score > targetPlayerScore) {
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