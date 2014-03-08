'use strict';

module.exports = function(options) {
    var viewFactory = require('./../views/arena.js');
    var modelFactory = require('../../shared/model.js');
    var spawning = require('../../shared/spawning.js');
    var fixtures = require('../../shared/fixtures.js');
    var RNG = require('../../shared/utils/rng.js').RNG;
    var ARROW_LIFETIME = require('../../shared/arrows.js').ARROW_LIFETIME;

    function createModel(sources, sinks, initialSpawning) {
        return modelFactory.build({
            playerId: 0,
            level: {
                width: 3,
                height: 3,
                sources: sources,
                sinks: sinks
            },
            totalPlayers: 1,
            totalTime: Infinity,
            random: new RNG(),
            initialSpawning: initialSpawning
        });
    }

    function createView(container, model) {
        return viewFactory(container, model, null, function(newArrow) {
            model.addArrow(0, newArrow);
        });
    }

    var models = [];
    var controller = {};

    var DEFAULT_INPUT_METHOD = 'desktop';

    function getInputMethod() {
        return $.fn.cookie('inputMethod');
    }

    function setInputMethod(value) {
        $.fn.cookie('inputMethod', value, { expires: 9999 });
    }

    if (!getInputMethod()) {
        setInputMethod('desktop');
    }

    options.inputMethod = getInputMethod() || options.inputMethod || DEFAULT_INPUT_METHOD;

    function setupGameplayPreviews(models) {
        var rabbitsModel = createModel(
            [ new fixtures.Source(0, 0, 1) ],
            [
                { player: 0, x: 2, y: 2 }
            ],
            spawning.rabbitsOnly()
        );
        createView(document.getElementById('rabbits'), rabbitsModel);
        models.push(rabbitsModel);

        var foxesModel = createModel(
            [ new fixtures.Source(0, 2, 0)],
            [
                { player: 0, x: 2, y: 0 }
            ],
            spawning.foxesOnly()
        );
        createView(document.getElementById('foxes'), foxesModel);
        models.push(foxesModel);

        var arrowsModel = createModel(
            [ new fixtures.Source(0, 0, 1) ],
            [
                { player: null, x: 2, y: 0},
                {player: 0, x: 2, y: 2}
            ],
            spawning.rabbitsOnly()
        );

        var replaceArrows = function () {
            arrowsModel.addArrow(0, {
                x: 1,
                y: 0,
                direction: 2
            });
            arrowsModel.addArrow(0, {
                x: 0,
                y: 2,
                direction: 1
            });
        };

        replaceArrows();

        setInterval(replaceArrows, ARROW_LIFETIME + 500);

        var arrowsView = createView(document.getElementById('arrows'), arrowsModel, function placeArrow(newArrow) {
            arrowsModel.addArrow(0, newArrow);
        });
        arrowsView.setInputMethod(options.inputMethod);
        models.push(arrowsModel);
        return arrowsView;
    }

    function setupInputOptions(arrowsView) {
        var inputs = $('input.input');

        var onInputClick = function () {
            setInputMethod($(this).val());
            options.inputMethod = $(this).val();
            arrowsView.setInputMethod(options.inputMethod);
        };

        inputs.each(function(i, input) {
            if ($(input).val() === options.inputMethod) {
                input.checked = true;
            }
            if (!$(input).attr('disabled')) {
                input.onclick = onInputClick;
            }
        });
    }

    controller.open = false;

    controller.show = function show() {
        var arrowsView = setupGameplayPreviews(models);
        setupInputOptions(arrowsView);
        document.getElementById('settings').classList.remove('hidden');
        controller.open = true;
    };

    controller.hide = function hide() {
        while (models.length) {
            models.pop().isRunning = false;
        }

        document.getElementById('settings').classList.add('hidden');
        controller.open = false;
    };

    return controller;
};