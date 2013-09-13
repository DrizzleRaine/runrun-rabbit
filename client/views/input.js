'use strict';

var keyMap = {
    87: 0,
    38: 0,
    68: 1,
    39: 1,
    83: 2,
    40: 2,
    65: 3,
    37: 3
};

function directionFromKey(keyCode) {
    if (keyCode && keyMap.hasOwnProperty(keyCode.toString())) {
        return keyMap[keyCode];
    } else {
        return null;
    }
}

var methods = {};
var constants = require('../graphics/constants.js');

module.exports = methods;

function clearHandlers(arena) {
    window.oncontextmenu = null;
    window.onkeydown = null;
    window.onkeyup = null;
    arena.onmousedown = null;
    arena.onmousemove = null;
}

methods.desktop = function desktop(arena, placeArrowCallback) {
    var activeKey;

    var offsetX;
    var offsetY;

    window.oncontextmenu = function() { return false; };

    window.onkeydown = function (event) {
        if (directionFromKey(event.keyCode) !== null) {
            activeKey = event.keyCode;
            event.preventDefault();
        }
    };

    window.onkeyup = function (event) {
        if (event.keyCode === activeKey) {
            activeKey = null;
        }
    };

    arena.onmousedown = function(event) {
        if (!placeArrowCallback) {
            return;
        }

        var direction = directionFromKey(activeKey);

        if (direction === null) {
            return;
        }

        offsetX = offsetX || arena.offsetLeft + (arena.offsetWidth - arena.width) / 2;
        offsetY = offsetY || arena.offsetTop + (arena.offsetHeight - arena.height) / 2;

        placeArrowCallback(
            Math.floor((event.clientX - offsetX) / constants.CELL_SIZE),
            Math.floor((event.clientY - offsetY) / constants.CELL_SIZE),
            direction
        );
    };

    return {
        unbind: function() { clearHandlers(arena); }
    };
};

methods.laptop = function desktop(arena, placeArrowCallback) {
    var currentLocation = {};

    var offsetX;
    var offsetY;

    window.oncontextmenu = function() { return false; };

    arena.onmousemove = function(event) {
        offsetX = offsetX || arena.offsetLeft + (arena.offsetWidth - arena.width) / 2;
        offsetY = offsetY || arena.offsetTop + (arena.offsetHeight - arena.height) / 2;

        currentLocation.x = event.clientX - offsetX;
        currentLocation.y = event.clientY - offsetY;
    };

    window.onkeydown = function(event) {
        event.preventDefault();
    };

    window.onkeyup = function (event) {
        var direction = directionFromKey(event.keyCode);
        if (direction !== null && currentLocation.x > 0 && currentLocation.y > 0 &&
            currentLocation.x < arena.width && currentLocation.y < arena.height) {
            placeArrowCallback(
                Math.floor(currentLocation.x / constants.CELL_SIZE),
                Math.floor(currentLocation.y / constants.CELL_SIZE),
                direction
            );
            event.preventDefault();
        }
    };

    return {
        unbind: function() { clearHandlers(arena); }
    };
};