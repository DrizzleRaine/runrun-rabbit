'use strict';

module.exports = function(options) {
    var viewFactory = require('../../ui/components/arena.js');
    var modelFactory = require('../../shared/model.js');
    var spawning = require('../../shared/spawning.js');
    var fixtures = require('../../shared/fixtures.js');
    var RNG = require('../../shared/utils/rng.js').RNG;
    var ARROW_LIFETIME = require('../../shared/arrows.js').ARROW_LIFETIME;

    var model;
    var controller = { options: options };

    var DEFAULT_VISUAL_STYLE = 'standard';

    options.visualStyle = localStorage.visualStyle || options.visualStyle || DEFAULT_VISUAL_STYLE;

    function setupPreview() {
        var container = document.getElementById('four-player-preview');

        model = modelFactory.build({
            level: {
                width: 6,
                height: 6,
                sources: [ new fixtures.Source(2, 0, 2), new fixtures.Source(5, 2, 3),
                    new fixtures.Source(3, 5, 0), new fixtures.Source(0, 3, 1) ],
                sinks: [ new fixtures.Sink(0, 4, 0), new fixtures.Sink(1, 5, 4),
                    new fixtures.Sink(2, 1, 5), new fixtures.Sink(3, 0, 1)]
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
                direction: 0
            });
            model.addArrow(1, {
                x: 3,
                y: 3,
                direction: 1
            });
            model.addArrow(2, {
                x: 2,
                y: 3,
                direction: 2
            });
            model.addArrow(3, {
                x: 2,
                y: 2,
                direction: 3
            });
        };

        replaceArrows();

        setInterval(replaceArrows, ARROW_LIFETIME + 500);

        view.setVisualStyle(options.visualStyle);
        return view;
    }

    controller.visualStyles = [
        {
            key: 'standard',
            title: 'Universal (mouse or touchscreen)',
            description: 'Players are differentiated by colour only. Make sure you can tell the difference between the four player arrows below&hellip;'
        },
        {
            key: 'redGreen',
            title: 'Red-green colourblind',
            description: 'Red and yellow players are distinguished from green and blue players by shape (designed for protanopia and deuteranopia).'
        },
        {
            key: 'blueYellow',
            title: 'Blue-yellow colourblind',
            description: 'Blue and red players are distinguished from yellow and green players by shape (designed for tritanopia).'
        }
    ];

    controller.open = false;

    var preview;

    controller.update = function() {
        localStorage.visualStyle = options.visualStyle;
        preview.setVisualStyle(options.visualStyle);
    };

    controller.show = function show() {
        preview = setupPreview();
        controller.open = true;
    };

    controller.hide = function hide() {
        model.isRunning = false;
        controller.open = false;
    };

    return controller;
};