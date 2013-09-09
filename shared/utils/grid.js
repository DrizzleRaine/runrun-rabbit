'use strict';

module.exports.getAtCell = function getAtCell(objects, x, y) {
    for (var i = 0; i < objects.length; ++i) {
        if (objects[i].x === x && objects[i].y === y) {
            return objects[i];
        }
    }
    return null;
};