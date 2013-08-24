var game = game || {};

game.controller = (function() {


    var init = function() {
        window.oncontextmenu = function() { return false };

        var model = game.model();
        var view = game.view(model);

        var activeKey = null;

        $(document).keydown(function (event) {
            if (event.keyCode > 36 && event.keyCode < 41) {
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
                model.addArrow(0, cell, (activeKey + 2) % 4);
            }
        });
    };

    return {
        init: init
    }

}());