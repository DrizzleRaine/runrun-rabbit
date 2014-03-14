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

function disableArrowKeys() {
    // Prevent accidental scrolling or other confusing behaviour (e.g. switching selected radio buttons)
    var onKeyDown = function (event) {
        if (directionFromKey(event.keyCode) !== null) {
            event.preventDefault();
        }
    };

    window.addEventListener('keydown', onKeyDown);

    return {
        unbind: function() {
            window.removeEventListener('keyDown', onKeyDown);
        }
    };
}

function disableContextMenu() {
    var onContextMenu = function(event) {
        event.preventDefault();
    };

    window.addEventListener('contextmenu', onContextMenu);

    return {
        unbind: function() {
            window.removeEventListener('contextmenu', onContextMenu);
        }
    };
}

module.exports.methods = {};

var offsetHandler = module.exports.offSetHandler = function offsetHandler(grid) {
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

    function isInGrid(relativeX, relativeY) {
        return relativeX > 0 && relativeY > 0 && relativeX < grid.view.width && relativeY < grid.view.height;
    }

    return {
        getRelativeX: getRelativeX,
        getRelativeY: getRelativeY,
        normalise: normalise,
        isInGrid: isInGrid
    };
};

module.exports.methods.desktop = function desktop(grid, placeArrowCallback) {
    var activeKey;
    var handler = offsetHandler(grid);

    var onKeyDown = function (event) {
        if (directionFromKey(event.keyCode) !== null) {
            activeKey = event.keyCode;
            event.preventDefault();
        }
    };

    var onKeyUp = function (event) {
        if (event.keyCode === activeKey) {
            activeKey = null;
        }
    };

    var onMouseDown = function(event) {
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

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    grid.view.addEventListener('mousedown', onMouseDown);
    var contextMenuDisabled = disableContextMenu();

    return {
        unbind: function() {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            grid.view.removeEventListener('mousedown', onMouseDown);
            contextMenuDisabled.unbind();
        }
    };
};

module.exports.methods.laptop = function laptop(grid, placeArrowCallback) {
    var currentLocation = {};
    var handler = offsetHandler(grid);

    var onMouseMove = function(event) {
        currentLocation.x = handler.getRelativeX(event);
        currentLocation.y = handler.getRelativeY(event);
    };

    var onKeyUp = function (event) {
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

    grid.view.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keyup', onKeyUp);
    var arrowKeysDisabled = disableArrowKeys();
    var contextMenuDisabled = disableContextMenu();

    return {
        unbind: function() {
            grid.view.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('keyup', onKeyUp);
            arrowKeysDisabled.unbind();
            contextMenuDisabled.unbind();
        }
    };
};

module.exports.methods.universal = function universal(grid, placeArrowCallback) {
    var start;
    var handler = offsetHandler(grid);

    var directionFromSwipe = function directionFromSwipe(start, end) {
        var changeX = end.pageX - start.pageX;
        var changeY = end.pageY - start.pageY;

        if (changeX === 0 && changeY === 0) {
            return null;
        }

        return Math.abs(changeX) > Math.abs(changeY) ?
            (changeX > 0 ? 1 : 3) :
            (changeY > 0 ? 2 : 0);
    };

    var onEnd = function(end) {
        if (!start) {
            return;
        }

        var startX = handler.getRelativeX(start);
        var startY = handler.getRelativeY(start);

        var direction = directionFromSwipe(start, end);

        if (direction !== null && handler.isInGrid(startX, startY)) {
            placeArrowCallback(
                handler.normalise(startX),
                handler.normalise(startY),
                direction
            );
        }

        start = null;
    };

    var onMouseDown = function(event) {
        start = event;
    };

    var onTouchStart = function(event) {
        start = event.changedTouches[0];
    };

    var onTouchEnd = function(event) {
        onEnd(event.changedTouches[0]);
    };

    var onTouchMove = function(event) {
        if (start) { // Prevent scrolling while placing arrows
            event.preventDefault();
        }
    };

    grid.view.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchmove', onTouchMove);
    grid.view.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onEnd);
    var arrowKeysDisabled = disableArrowKeys();

    return {
        unbind: function() {
            grid.view.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchend', onTouchEnd);
            window.removeEventListener('touchmove', onTouchMove);
            grid.view.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onEnd);
            arrowKeysDisabled.unbind();
        }
    };
};
