'use strict';

module.exports.components = function components(direction) {
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

module.exports.isValid = function isValid(direction, model, centreX, centreY) {
    var targetX = centreX + direction.x;
    var targetY = centreY + direction.y;

    return (targetX >= 0 && targetY >= 0 && targetX < model.width && targetY < model.height);
};