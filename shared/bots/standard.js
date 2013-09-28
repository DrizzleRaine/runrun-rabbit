'use strict';

var paths = require('./paths.js');

var Bot = module.exports.Bot = function Bot(playerId) {
    this.playerId = playerId;
};


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

    var bestPaths = [];
    var finder = this.pathFinder;

    this.model.sources.forEach(function(source) {
        var path = finder.findBestPath({
            x: source.x,
            y: source.y,
            d: source.direction,
            g: 0
        });
        if (path) {
            bestPaths.push(path);
        }
    });

    bestPaths.sort(function(a, b) {
        return a.cost - b.cost;
    });

    var totalArrows = 0;
    var chosenPath;
    while (totalArrows < MAX_ARROWS && (chosenPath = bestPaths.shift())) {
        totalArrows += chosenPath.arrows.length;
        this.implementPath(chosenPath);
    }

    setTimeout(this.update.bind(this), 1000);
};

Bot.prototype.start = function startBot(model) {
    this.model = model;
    this.pathFinder = new paths.Finder(this.model, this.playerId);
    setTimeout(this.update.bind(this), 1000);
};