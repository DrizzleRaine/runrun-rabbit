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

function offsetHandler(grid) {
    var offsetX;
    var offsetY;

    window.onresize = function() {
        offsetX = null;
        offsetY = null;
    };

    function getRelativeX(event) {
        offsetX = offsetX || grid.view.offsetLeft + (grid.view.offsetWidth - grid.view.width) / 2;
        return event.pageX - offsetX;
    }

    function getRelativeY(event) {
        offsetY = offsetY || grid.view.offsetTop + (grid.view.offsetHeight - grid.view.height) / 2;
        return event.pageY - offsetY;
    }

    function normalise(pixels) {
        return Math.floor(pixels / grid.unit);
    }

    function isInGrid(x, y) {
        return x > 0 && y > 0 && x < grid.view.width && y < grid.view.height
    }

    return {
        getRelativeX: getRelativeX,
        getRelativeY: getRelativeY,
        normalise: normalise,
        isInGrid: isInGrid
    };
}

methods.desktop = function desktop(grid, placeArrowCallback) {
    var activeKey;
    var handler = offsetHandler(grid);

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
            handler.normalise(handler.getRelativeX(event)),
            handler.normalise(handler.getRelativeY(event)),
            direction
        );
    };

    return {
        unbind: function() { clearHandlers(grid.view); }
    };
};

methods.laptop = function desktop(grid, placeArrowCallback) {
    var currentLocation = {};
    var handler = offsetHandler(grid);

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
        if (direction !== null && handler.isInGrid(currentLocation.x, currentLocation.y)) {
            placeArrowCallback(
                handler.normalise(currentLocation.x),
                handler.normalise(currentLocation.y),
                direction
            );
            event.preventDefault();
        }
    };

    return {
        unbind: function() { clearHandlers(grid.view); }
    };
};

methods.mobile = function desktop(grid, placeArrowCallback) {
    var start = null;
    var handler = offsetHandler(grid);

    var directionFromSwipe = function directionFromSwipe(start, end) {
        var changeX = end.pageX - start.pageX;
        var changeY = end.pageY - start.pageY;

        return Math.abs(changeX) > Math.abs(changeY)
            ? (changeX > 0 ? 1 : 3)
            : (changeY > 0 ? 2 : 0)
    };

    var onTouchStart = function(event) {
        start = event.changedTouches[0];
    };

    var onTouchEnd = function(event) {
        var end = event.changedTouches[0];

        if (!start) {
            return;
        }

        placeArrowCallback(
            handler.normalise(handler.getRelativeX(start)),
            handler.normalise(handler.getRelativeY(start)),
            directionFromSwipe(start, end)
        );

        start = null;
    };

    grid.view.addEventListener('touchstart', onTouchStart);
    grid.view.addEventListener('touchend', onTouchEnd);

    return {
        unbind: function() {
            grid.view.removeEventListener('touchstart', onTouchStart);
            grid.view.removeEventListener('touchend', onTouchEnd);
        }
    };
};
