var game = game || {};

game.controller = (function() {


    var init = function() {
        var model = game.model();
        var view = game.view(model);

        view.click(function(cell) {
            model.activate(cell);
        });
    };

    return {
        init: init
    }

}());