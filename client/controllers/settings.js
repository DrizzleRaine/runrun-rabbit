'use strict';

module.exports = (function() {
    var createView = require('./../views/arena.js');
    var modelFactory = require('../../shared/model.js');
    var sprites = require('../../shared/sprites.js');

    function noOp() {}

    function PeriodicSource(x, y, direction, period, type) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.lastUpdate = 0;
        this.init = noOp;
        this.update = function(model, gameTime) {
            if (Math.floor(gameTime / period) > Math.floor(this.lastUpdate / period)) {
                model.critters.push(new sprites.Critter(this, type, gameTime));
            }
            this.lastUpdate = gameTime;
        };
    }

    function createModel(sources, sinks) {
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
            random: { spawn: noOp }
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
            [ new PeriodicSource(0, 1, 1, 1000, sprites.RABBIT) ], [ { player:0, x:2, y: 1 } ]);
        createView(document.getElementById('rabbits'), rabbitsModel);
        models.push(rabbitsModel);

        var foxesModel = createModel(
            [ new PeriodicSource(1, 2, 0, 2000, sprites.FOX)], [ { player:0, x:1, y: 0 } ]);
        createView(document.getElementById('foxes'), foxesModel);
        models.push(foxesModel);

        var arrowsModel = createModel(
            [ new PeriodicSource(0, 0, 1, 1000, sprites.RABBIT) ],
            [ { player:null, x:2, y:0}, {player:0, x:2, y: 2} ]);
        arrowsModel.addArrow(0, {
            x: 1,
            y: 0,
            direction: 2,
            from: 0
        });
        arrowsModel.addArrow(0, {
            x: 1,
            y: 2,
            direction: 1,
            from: 0
        });

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