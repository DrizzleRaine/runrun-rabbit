'use strict';

var components = module.exports.components = function components(direction) {
    var ret = { x: 0, y: 0 };

    switch (direction) {
    case 0:
        ret.y = -1;
        break;
    case 1:
        ret.x = 1;
        break;
    case 2:
        ret.y += 1;
        break;
    case 3:
        ret.x = -1;
        break;
    }
    return ret;
};

module.exports.forEach = function forEachDirection(callback) {
    for (var direction = 0; direction < 4; ++ direction) {
        callback(components(direction), direction);
    }
};

var isValid = module.exports.isValid = function isValid(direction, model, centreX, centreY) {
    var targetX = centreX + direction.x;
    var targetY = centreY + direction.y;

    return (targetX >= 0 && targetY >= 0 && targetX < model.width && targetY < model.height);
};

module.exports.opposing = function opposingDirection(a, b) {
    return a.x === -b.x && a.y === -b.y;
};

module.exports.equal = function equalDirection(a, b) {
    return a.x === b.x && a.y === b.y;
};

module.exports.getNatural = function getNaturalDirection(direction, model, centreX, centreY) {
    var rotation = 0;
    while (!isValid(components(direction), model, centreX, centreY)) {
        direction = (direction + (++rotation)) % 4;
    }
    return direction;
};