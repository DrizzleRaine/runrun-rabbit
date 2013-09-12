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
    if (keyMap.hasOwnProperty(keyCode.toString())) {
        return keyMap[keyCode];
    } else {
        return null;
    }
}

module.exports = function build(arena, placeArrowCallback) {
    var constants = require('../graphics/constants.js');

    var activeKey;
    
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

    var offsetX = arena.offsetLeft + (arena.offsetWidth - arena.width) / 2;
    var offsetY = arena.offsetTop + (arena.offsetHeight - arena.height) / 2;

    arena.onmousedown = function(event) {
        if (!placeArrowCallback) {
            return;
        }

        if (activeKey === null) {
            return;
        }

        placeArrowCallback(
            Math.floor((event.clientX - offsetX) / constants.CELL_SIZE),
            Math.floor((event.clientY - offsetY) / constants.CELL_SIZE),
            directionFromKey(activeKey)
        );
    };
};