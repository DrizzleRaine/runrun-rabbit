'use strict';

module.exports = function(options) {
    var viewFactory = require('./../views/arena.js');
    var modelFactory = require('../../shared/model.js');
    var spawning = require('../../shared/spawning.js');
    var fixtures = require('../../shared/fixtures.js');
    var RNG = require('../../shared/utils/rng.js').RNG;
    var ARROW_LIFETIME = require('../../shared/arrows.js').ARROW_LIFETIME;
    var MINI = window.require('minified');
    var $ = MINI.$;//, $$=MINI.$$, EE=MINI.EE;

    var model;
    var controller = { options: {} };

    var DEFAULT_VISUAL_STYLE = 'standard';

    function getVisualStyle() {
        return $.getCookie('visualStyle');
    }

    function setVisualStyle(value) {
        $.setCookie('visualStyle', value, 9999);
    }
    if (!getVisualStyle()) {
        setVisualStyle('standard');
    }

    options.visualStyle = getVisualStyle() || options.visualStyle || DEFAULT_VISUAL_STYLE;

    function setupAccessibilityOptions() {
        var container = document.getElementById('four-player-preview');

        model = modelFactory.build({
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

        view.setVisualStyle(options.visualStyle);

        var inputs = $('input.visuals');

        var onInputClick = function () {
            setVisualStyle($(this).get('value'));
            options.visualStyle = $(this).get('value');
            view.setVisualStyle(options.visualStyle);
        };

        inputs.each(function(input) {
            if ($(input).get('value') === options.visualStyle) {
                input.checked = true;
            }
            input.onclick = onInputClick;
        });
    }

    controller.open = false;

    controller.show = function show() {
        setupAccessibilityOptions();
        document.getElementById('accessibility').classList.remove('hidden');
        controller.open = true;
    };

    controller.hide = function hide() {
        model.isRunning = false;
        document.getElementById('accessibility').classList.add('hidden');
        controller.open = false;
    };

    return controller;
};