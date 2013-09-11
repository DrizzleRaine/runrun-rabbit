'use strict';

module.exports = function build(arena, placeArrowCallback) {
    var constants = require('../graphics/constants.js');
    var direction = require('../../shared/utils/direction.js');

    var activeKey;
    
    window.oncontextmenu = function() { return false; };

    window.onkeydown = function (event) {
        if (direction.fromKey(event.keyCode) !== null) {
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
            direction.fromKey(activeKey)
        );
    };
};