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
    var controller = { options: options };

    var DEFAULT_INPUT_METHOD = 'universal';

    options.inputMethod = localStorage.inputMethod || options.inputMethod || DEFAULT_INPUT_METHOD;

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

    controller.inputMethods = [
        {
            key: 'universal',
            title: 'Universal (mouse or touchscreen)',
            description: 'Place arrows by <b>touching/clicking</b> a square and<br /><b>swiping/dragging</b> left/right/up/down.'
        },
        {
            key: 'desktop',
            title: 'Desktop (mouse and keyboard)',
            description: 'Place arrows by <b>holding</b> one of the <span class="nowrap">&larr;/&uarr;/&rarr;/&darr;</span> or <span class="nowrap">W/A/S/D</span> keys and <b>clicking</b> on a square.'
        },
        {
            key: 'laptop',
            title: 'Laptop (touchpad and keyboard)',
            description: 'Place arrows by <b>hovering</b> over a square and <b>pressing</b> one of the <span class="nowrap">&larr;/&uarr;/&rarr;/&darr;</span> or <span class="nowrap">W/A/S/D</span> keys.'
        }
    ];

    controller.open = false;

    var arrowsView;

    controller.update = function() {
        localStorage.inputMethod = options.inputMethod;
        arrowsView.setInputMethod(options.inputMethod);
    };

    controller.show = function show() {
        arrowsView = setupGameplayPreviews(models);
        controller.open = true;
    };

    controller.hide = function hide() {
        while (models.length) {
            models.pop().isRunning = false;
        }
        controller.open = false;
    };

    return controller;
};