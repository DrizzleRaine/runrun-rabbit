var game = game || {};

game.controller = (function() {
    var keyMap = {
        87: 0,
        38: 0,
        68: 1,
        39: 1,
        83: 2,
        40: 2,
        65: 3,
        37: 3
    }

    var init = function() {
        window.oncontextmenu = function() { return false };

        var model = game.model();
        var view = game.view(document.body, model);

        var activeKey = null;

        $(document).keydown(function (event) {
            if (keyMap.hasOwnProperty(event.keyCode.toString())) {
                activeKey = event.keyCode;
            }
        });

        $(document).keyup(function (event) {
            if (event.keyCode === activeKey) {
                activeKey = null;
            }
        });

        view.click(function(cell) {
            if (activeKey !== null) {
                model.addArrow(0, cell, keyMap[activeKey]);
            }
        });
    };

    return {
        init: init
    }

}());