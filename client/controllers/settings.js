'use strict';

module.exports = (function() {
    var viewFactory = require('./../views/arena.js');
    var modelFactory = require('../../shared/model.js');
    var spawning = require('../../shared/spawning.js');
    var fixtures = require('../../shared/fixtures.js');
    var RNG = require('../../shared/utils/rng.js').RNG;

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
            model.addArrow(0, newArrow)
        });
    }

    function setCookie(value) {
        document.cookie = 'inputMethod=' + value + '; expires=Fri, 31 Dec 9999 23:59:59 GMT';
    }

    var models = [];
    var controller = {};

    if (!document.cookie) {
        setCookie('desktop');
    }
    controller.inputMethod = document.cookie.split('=')[1] || controller.inputMethod || 'desktop';

    controller.show = function show() {
        var rabbitsModel = createModel(
            [ new fixtures.Source(0, 0, 1) ],
            [ { player:0, x:2, y: 2 } ],
            spawning.rabbitsOnly()
        );
        createView(document.getElementById('rabbits'), rabbitsModel);
        models.push(rabbitsModel);

        var foxesModel = createModel(
            [ new fixtures.Source(0, 2, 0)],
            [ { player:0, x:2, y: 0 } ],
            spawning.foxesOnly()
        );
        createView(document.getElementById('foxes'), foxesModel);
        models.push(foxesModel);

        var arrowsModel = createModel(
            [ new fixtures.Source(0, 0, 1) ],
            [ { player:null, x:2, y:0}, {player:0, x:2, y: 2} ],
            spawning.rabbitsOnly()
        );

        var replaceArrows = function() {
            arrowsModel.addArrow(0, {
                x: 1,
                y: 0,
                direction: 2,
                from: arrowsModel.lastUpdate + 1
            });
            arrowsModel.addArrow(0, {
                x: 0,
                y: 2,
                direction: 1,
                from: arrowsModel.lastUpdate + 1
            });
        };

        replaceArrows();

        setInterval(replaceArrows, 11000);

        var arrowsView = createView(document.getElementById('arrows'), arrowsModel, function placeArrow(newArrow) {
            arrowsModel.addArrow(0, newArrow);
        });
        arrowsView.inputMethod(controller.inputMethod);
        models.push(arrowsModel);

        var inputs = document.getElementsByTagName('input');
        var inputClick = function() {
            setCookie(this.getAttribute('value'));
            controller.inputMethod = this.getAttribute('value');
            arrowsView.inputMethod(controller.inputMethod);
        };

        for (var i = 0 ; i < inputs.length; ++i) {
            if (inputs[i].getAttribute('value') === controller.inputMethod) {
                inputs[i].checked = true;
            }
            if (!inputs[i].disabled) {
                inputs[i].onclick = inputClick;
            }
        }

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