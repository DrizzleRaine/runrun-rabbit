'use strict';

var Bot = module.exports.Bot = function Bot(playerId) {
    this.playerId = playerId;
};

var gridUtils = require('../utils/grid.js');
var directionUtils = require('../utils/direction.js');

var MAX_ARROWS = require('../arrows.js').MAX_ARROWS;
var TICK_INTERVAL = require('../model.js').TICK_INTERVAL;

var comparePaths = function(a, b) {
    return a.arrows.length - b.arrows.length || a.length - b.length;
};

Bot.prototype.update = function update() {
    if (!this.model.isRunning) {
        return;
    }

    var model = this.model;
    var playerId = this.playerId;

    var findPaths = function findPaths(completePaths, currentPath) {
        directionUtils.forEach(function(direction, index) {
            if (directionUtils.opposing(direction, currentPath.direction)) {
                return;
            }

            if (directionUtils.isValid(direction, model, currentPath.x, currentPath.y)) {
                var updatedPath = {
                    x: (currentPath.x + direction.x),
                    y: (currentPath.y + direction.y),
                    direction: direction,
                    arrows: currentPath.arrows.concat(),
                    length: currentPath.length + 1
                };

                if (!directionUtils.equal(currentPath.direction, direction)) {
                    if (currentPath.arrows.length === MAX_ARROWS) {
                        return;
                    } else {
                        updatedPath.arrows.push({
                            x: currentPath.x,
                            y: currentPath.y,
                            direction: index,
                            from: model.lastUpdate + TICK_INTERVAL / 2
                        });
                    }
                }

                var sink = gridUtils.getAtCell(model.sinks, updatedPath.x, updatedPath.y);
                if (sink) {
                    if (sink.player === playerId) {
                        completePaths.push(updatedPath);
                    }
                    return;
                }

                findPaths(completePaths, updatedPath);
            }
        });
    };

    var bestPaths = [];

    this.model.sources.forEach(function(source) {
        var possiblePaths = [];
        var sourceDirection = directionUtils.components(source.direction);
        findPaths(possiblePaths, {
            x: source.x + sourceDirection.x,
            y: source.y + sourceDirection.y,
            direction: sourceDirection,
            arrows: [],
            length: 1
        });
        if (possiblePaths.length) {
            bestPaths.push(possiblePaths.sort(comparePaths)[0]);
        }
    });

    bestPaths.sort(comparePaths);

    var implementPath = function(path) {
        path.arrows.forEach(function(arrow) {
            model.addArrow(playerId, arrow);
        });
    };

    var totalCost = 0;
    var chosenPath;
    while (totalCost < MAX_ARROWS && (chosenPath = bestPaths.shift())) {
        totalCost += chosenPath.arrows.length;
        implementPath(chosenPath);
    }

    setTimeout(this.update.bind(this), 1000);
};

Bot.prototype.start = function startBot(model) {
    this.model = model;
    setTimeout(this.update.bind(this), 1000);
};