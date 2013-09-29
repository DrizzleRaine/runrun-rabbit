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

module.exports = methods;

function clearHandlers(view) {
    window.oncontextmenu = null;
    window.onkeydown = null;
    window.onkeyup = null;
    window.onresize = null;
    view.onmousedown = null;
    view.onmousemove = null;
}

function offsetHandler(view) {
    var offsetX;
    var offsetY;

    window.onresize = function() {
        offsetX = null;
        offsetY = null;
    };

    function getRelativeX(event) {
        offsetX = offsetX || view.offsetLeft + (view.offsetWidth - view.width) / 2;
        return event.clientX - offsetX + document.body.scrollLeft;
    }

    function getRelativeY(event) {
        offsetY = offsetY || view.offsetTop + (view.offsetHeight - view.height) / 2;
        return event.clientY - offsetY + document.body.scrollTop;
    }

    return {
        getRelativeX: getRelativeX,
        getRelativeY: getRelativeY
    };
}

methods.desktop = function desktop(grid, placeArrowCallback) {
    var activeKey;
    var handler = offsetHandler(grid.view);

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

    grid.view.onmousedown = function(event) {
        if (!placeArrowCallback) {
            return;
        }

        var direction = directionFromKey(activeKey);

        if (direction === null) {
            return;
        }

        placeArrowCallback(
            Math.floor(handler.getRelativeX(event) / grid.unit),
            Math.floor(handler.getRelativeY(event) / grid.unit),
            direction
        );
    };

    return {
        unbind: function() { clearHandlers(grid.view); }
    };
};

methods.laptop = function desktop(grid, placeArrowCallback) {
    var currentLocation = {};
    var handler = offsetHandler(grid.view);

    window.oncontextmenu = function() { return false; };

    grid.view.onmousemove = function(event) {
        currentLocation.x = handler.getRelativeX(event);
        currentLocation.y = handler.getRelativeY(event);
    };

    window.onkeydown = function(event) {
        event.preventDefault();
    };

    window.onkeyup = function (event) {
        var direction = directionFromKey(event.keyCode);
        if (direction !== null && currentLocation.x > 0 && currentLocation.y > 0 &&
            currentLocation.x < grid.view.width && currentLocation.y < grid.view.height) {
            placeArrowCallback(
                Math.floor(currentLocation.x / grid.unit),
                Math.floor(currentLocation.y / grid.unit),
                direction
            );
            event.preventDefault();
        }
    };

    return {
        unbind: function() { clearHandlers(grid.view); }
    };
};