'use strict';

module.exports = function build(parent, model, placeArrowCallback) {
    var grid = require('../graphics/grid.js')(model);
    var fixtures = require('../graphics/fixtures.js')(grid);
    var sprites = require('../graphics/sprites.js')(grid);
    var critters = require('../../shared/sprites.js');
    var inputMethods = require('./input.js');

    parent.appendChild(grid.view);

    var isRunning = true;
    var startTime = new Date().getTime();

    var gameOverCallback;

    function animate() {
        model.update(new Date().getTime() - startTime);

        if (!model.isRunning) {
            close();
            if (gameOverCallback) {
                gameOverCallback();
            }
        }

        if (!isRunning) {
            return;
        }

        grid.clear();

        model.playerArrows.forEach(function(playerArrows, player) {
            playerArrows.forEach(function(arrow) {
                if (model.isArrowActive(arrow)) {
                    fixtures.drawArrow(player, arrow);
                }
            });
        });

        model.sources.forEach(function(source) {
            fixtures.drawSource(source);
        });

        model.sinks.forEach(function(sink) {
            fixtures.drawSink(sink);
        });

        var foxes = [];
        model.critters.forEach(function(critter) {
            if (critter.type === critters.FOX) {
                foxes.push(critter);
            } else {
                sprites.drawCritter(critter);
            }
        });

        while (foxes.length) {
            sprites.drawCritter(foxes.shift());
        }

        window.requestAnimationFrame(animate);
    }

    window.requestAnimationFrame(animate);

    var currentInputMethod;

    function setInputMethod(inputMethod) {
        if (currentInputMethod) {
            currentInputMethod.unbind();
        }

        grid.view.style.cursor = 'url("cursor-' + model.playerId + '.cur"), default';

        currentInputMethod = inputMethods[inputMethod](grid.view, function(x, y, direction) {
            if (!placeArrowCallback) {
                return;
            }

            placeArrowCallback({
                x: x,
                y: y,
                direction: direction,
                from: new Date().getTime() - startTime + 100
                // Give us a little bit of leeway for network lag, but not enough to be perceptible
            });
        });
    }

    function close() {
        isRunning = false;
        grid.clear();
        parent.removeChild(grid.view);
    }

    return {
        close: close,
        inputMethod: setInputMethod,
        gameOver: function(callback) { gameOverCallback = callback; }
    };
};