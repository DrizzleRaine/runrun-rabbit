'use strict';

// See http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html

var directionUtils = require('../utils/direction.js');
var gridUtils = require('../utils/grid.js');
var arrayUtils = require('../utils/array.js');

var ARROW_COST = 10;

var PathFinder = module.exports.Finder = function PathFinder(model, playerId) {
    this.model = model;
    this.playerId = playerId;

    if (!model.level.heuristicCache) {
        model.level.heuristicCache = arrayUtils.initialise(model.totalPlayers, function() {
            return arrayUtils.initialise(model.level.width, function() {
                return arrayUtils.initialise(model.level.height, function() {
                    return arrayUtils.initialise(4, undefined);
                });
            });
        });
    }
};

PathFinder.prototype.isPlayerSink = function (node, playerId) {
    var sink = gridUtils.getAtCell(this.model.level.sinks, node.x, node.y);
    return sink && (sink.player === playerId);
};


function nodePriority(a, b) {
    return b.f - a.f;
}

function sign(x) {
    return x === 0 ? 0 : (x > 0 ? 1 : -1);
}

PathFinder.prototype.heuristicCost = function (node, playerId) {
    if (!this.model.level.heuristicCache[playerId][node.x][node.y][node.d]) {
        var cheapest = Infinity;
        this.model.level.sinks.forEach(function(sink) {
            if (sink.player === playerId) {
                var dx = sink.x - node.x;
                var dy = sink.y - node.y;

                var cost = Math.abs(dx) + Math.abs(dy);

                var direction = directionUtils.components(node);

                if (direction.x !== sign(dx) || direction.y !== sign(dy)) {
                    cost += ARROW_COST;
                }

                if (cost < cheapest) {
                    cheapest = cost;
                }
            }
        }.bind(this));
        this.model.level.heuristicCache[playerId][node.x][node.y][node.d] = cheapest;
    }

    return this.model.level.heuristicCache[playerId][node.x][node.y][node.d];
};

PathFinder.prototype.reconstructPath = function (end) {
    var current = end;
    var arrows = [];
    while (current.from) {
        if (current.g > current.from.g + 1) {
            arrows.push({
                x: current.from.x,
                y: current.from.y,
                direction: current.d
            });
        }
        current = current.from;
    }
    return {
        arrows: arrows,
        cost: end.g
    };
};

PathFinder.prototype.matchingNodeInSet = function (haystack, needle) {
    for (var i = 0; i < haystack.length; ++i) {
        var current = haystack[i];
        if (current.x === needle.x && current.y === needle.y && current.d === needle.d) {
            return {
                value: current,
                index: i
            };
        }
    }
    return {};
};

PathFinder.prototype.findBestPath = function findBestPath(start, playerId) {
    var open = [start];
    var closed = [];
    while (open.length) {
        var current = open.pop();

        if (this.isPlayerSink(current, playerId)) {
            return this.reconstructPath(current);
        }

        closed.push(current);

        var arrow = this.model.getActiveArrow(this.model.lastUpdate, current.x, current.y);

        var force = arrow.arrow;
        if (!force || (arrow.player === this.playerId)) {
            force = gridUtils.getAtCell(this.model.level.sources, current.x, current.y);
        }

        if (force) {
            this.processDirection(current, open, closed, playerId)(directionUtils.components(force.direction), force.direction);
        } else {
            var natural = directionUtils.getNatural(current.d, this.model, current.x, current.y);
            directionUtils.forEach(this.processDirection(current, open, closed, playerId, natural));
        }

        open.sort(nodePriority);
    }

    return null;
};

PathFinder.prototype.processDirection = function(current, open, closed, playerId, natural) {
    return function(direction, index) {
        if (!directionUtils.isValid(direction, this.model, current.x, current.y)) {
            return;
        }

        var neighbour = {
            x: current.x + direction.x,
            y: current.y + direction.y,
            d: index,
            g: current.g + (index === natural ? 0 : ARROW_COST)
        };

        var foundSink = gridUtils.getAtCell(this.model.level.sinks, neighbour.x, neighbour.y);
        if (foundSink && foundSink.player !== playerId) {
            return;
        }

        var neighbourInOpen = this.matchingNodeInSet(open, neighbour);
        if (neighbourInOpen.value && neighbour.g < neighbourInOpen.value.g) {
            open.splice(neighbourInOpen.index, 1);
        }

        var neighbourInClosed = this.matchingNodeInSet(closed, neighbour);
        if (neighbourInClosed.value && neighbour.g < neighbourInClosed.value.g) {
            closed.splice(neighbourInClosed.index, 1);
        }

        if (!neighbourInOpen.value && !neighbourInClosed.value) {
            neighbour.from = current;
            neighbour.f = neighbour.g + this.heuristicCost(neighbour, playerId);
            open.push(neighbour);
        }

    }.bind(this);
};