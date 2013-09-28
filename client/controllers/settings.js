'use strict';

module.exports = (function() {
    var viewFactory = require('./../views/arena.js');
    var modelFactory = require('../../shared/model.js');
    var spawning = require('../../shared/spawning.js');
    var fixtures = require('../../shared/fixtures.js');
    var RNG = require('../../shared/utils/rng.js').RNG;
    var ARROW_LIFETIME = require('../../shared/arrows.js').ARROW_LIFETIME;
    var MINI = window.require('minified');
    var $ = MINI.$;//, $$=MINI.$$, EE=MINI.EE;

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
    var controller = { options: {} };

    var DEFAULT_INPUT_METHOD = 'desktop';
    var DEFAULT_VISUAL_STYLE = 'standard';

    function getInputMethod() {
        return $.getCookie('inputMethod');
    }

    function setInputMethod(value) {
        $.setCookie('inputMethod', value, 9999);
    }

    function getVisualStyle() {
        return $.getCookie('visualStyle');
    }

    function setVisualStyle(value) {
        $.setCookie('visualStyle', value, 9999);
    }

    if (!getInputMethod()) {
        setInputMethod('desktop');
    }

    if (!getVisualStyle()) {
        setVisualStyle('standard');
    }

    controller.options.inputMethod = getInputMethod() || controller.options.inputMethod || DEFAULT_INPUT_METHOD;
    controller.options.visualStyle = getVisualStyle() || controller.options.visualStyle || DEFAULT_VISUAL_STYLE;

    function setupGameplayPreviews(models, controller) {
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
        arrowsView.setInputMethod(controller.options.inputMethod);
        models.push(arrowsModel);
        return arrowsView;
    }

    function setupInputOptions(arrowsView) {
        var inputs = $('input.input');

        var onInputClick = function () {
            setInputMethod($(this).get('value'));
            controller.options.inputMethod = $(this).get('value');
            arrowsView.setInputMethod(controller.options.inputMethod);
        };

        inputs.each(function(input) {
            if ($(input).get('value') === controller.options.inputMethod) {
                input.checked = true;
            }
            if (!$(input).get('disabled')) {
                input.onclick = onInputClick;
            }
        });
    }

    function setupAccessibilityOptions() {
        var container = document.getElementById('four-player-preview');

        var model = modelFactory.build({
            level: {
                width: 6,
                height: 6,
                sources: [ new fixtures.Source(3, 0, 2), new fixtures.Source(5, 3, 3),
                    new fixtures.Source(2, 5, 0), new fixtures.Source(0, 2, 1) ],
                sinks: [ new fixtures.Sink(0, 5, 2), new fixtures.Sink(1, 3, 5),
                    new fixtures.Sink(2, 0, 3), new fixtures.Sink(3, 2, 0)]
            },
            totalPlayers: 4,
            totalTime: Infinity,
            random: new RNG(),
            initialSpawning: spawning.standard()
        });

        var view = viewFactory(container, model);

        var replaceArrows = function () {
            model.addArrow(0, {
                x: 3,
                y: 2,
                direction: 1
            });
            model.addArrow(1, {
                x: 3,
                y: 3,
                direction: 2
            });
            model.addArrow(2, {
                x: 2,
                y: 3,
                direction: 3
            });
            model.addArrow(3, {
                x: 2,
                y: 2,
                direction: 0
            });
        };

        replaceArrows();

        setInterval(replaceArrows, ARROW_LIFETIME + 500);

        view.setVisualStyle(controller.options.visualStyle);

        var inputs = $('input.visuals');

        var onInputClick = function () {
            setVisualStyle($(this).get('value'));
            controller.options.visualStyle = $(this).get('value');
            view.setVisualStyle(controller.options.visualStyle);
        };

        inputs.each(function(input) {
            if ($(input).get('value') === controller.options.visualStyle) {
                input.checked = true;
            }
            input.onclick = onInputClick;
        });
    }

    controller.show = function show() {
        var arrowsView = setupGameplayPreviews(models, controller);
        setupInputOptions(arrowsView);
        setupAccessibilityOptions();
        document.getElementById('settings').classList.remove('hidden');
    };

    controller.hide = function hide() {
        while (models.length) {
            models.pop().isRunning = false;
        }

        document.getElementById('settings').classList.add('hidden');
    };

    return controller;
}());