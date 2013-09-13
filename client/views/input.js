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
    window.onresize = null;
    arena.onmousedown = null;
    arena.onmousemove = null;
}

function offsetHandler(arena) {
    var offsetX;
    var offsetY;

    window.onresize = function() {
        offsetX = null;
        offsetY = null;
    };

    function getRelativeX(event) {
        offsetX = offsetX || arena.offsetLeft + (arena.offsetWidth - arena.width) / 2;
        return event.clientX - offsetX + document.body.scrollLeft;
    }

    function getRelativeY(event) {
        offsetY = offsetY || arena.offsetTop + (arena.offsetHeight - arena.height) / 2;
        return event.clientY - offsetY + document.body.scrollTop;
    }

    return {
        getRelativeX: getRelativeX,
        getRelativeY: getRelativeY
    };
}

methods.desktop = function desktop(arena, placeArrowCallback) {
    var activeKey;
    var handler = offsetHandler(arena);

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

        placeArrowCallback(
            Math.floor(handler.getRelativeX(event) / constants.CELL_SIZE),
            Math.floor(handler.getRelativeY(event) / constants.CELL_SIZE),
            direction
        );
    };

    return {
        unbind: function() { clearHandlers(arena); }
    };
};

methods.laptop = function desktop(arena, placeArrowCallback) {
    var currentLocation = {};
    var handler = offsetHandler(arena);

    window.oncontextmenu = function() { return false; };

    arena.onmousemove = function(event) {
        currentLocation.x = handler.getRelativeX(event);
        currentLocation.y = handler.getRelativeY(event);
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