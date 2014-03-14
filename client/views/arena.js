'use strict';

module.exports = function build(parent, model, gameData, placeArrowCallback) {
    var input = require('./input.js');
    var critters = require('../../shared/sprites.js');

    var grid = require('../graphics/grid.js')(model);
    var fixtures = require('../graphics/fixtures.js')(grid);

    var sprites = require('../graphics/sprites.js')(grid);
    var cursors = require('../graphics/cursors.js')(grid);

    parent.appendChild(grid.view);
    var hud = require('./hud').build(parent, gameData);

    var isRunning = true;
    var startTime = new Date().getTime();

    var gameOverCallback;
    var playerPosition;

    function animate() {
        var gameTime = new Date().getTime() - startTime;
        model.update(gameTime);

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

        model.playerArrows.forEach(function(arrow, player) {
            if (arrow.isActive(gameTime)) {
                fixtures.drawArrow(player, arrow, gameTime);
            }
        });

        model.level.sources.forEach(function(source) {
            fixtures.drawSource(source);
        });

        model.level.sinks.forEach(function(sink) {
            fixtures.drawSink(sink);
        });

        var foxes = [];
        model.critters.forEach(function(critter) {
            if (critter.type === critters.FOX) {
                foxes.push(critter);
            } else {
                sprites.drawCritter(critter, gameTime);
            }
        });

        while (foxes.length) {
            sprites.drawCritter(foxes.shift(), gameTime);
        }

        if (playerPosition) {
            cursors.drawCursor(model.playerId, playerPosition.x, playerPosition.y);
        }

        hud.update({
            score: model.playerScores.current,
            time: gameTime
        });

        window.requestAnimationFrame(animate);
    }

    window.requestAnimationFrame(animate);

    var currentInputMethod;

    function setInputMethod(inputMethod) {
        if (currentInputMethod) {
            currentInputMethod.unbind();
        }

        var handler = input.offSetHandler(grid);

        grid.view.style.cursor = 'none';
        grid.view.addEventListener('mousemove', function(event) {
            playerPosition = {
                x: handler.getRelativeX(event),
                y: handler.getRelativeY(event)
            };
        });
        grid.view.addEventListener('mouseout', function() {
            playerPosition = null;
        });

        currentInputMethod = input.methods[inputMethod](grid, function(x, y, direction) {
            if (!placeArrowCallback) {
                return;
            }

            placeArrowCallback({
                x: x,
                y: y,
                direction: direction,
                from: new Date().getTime() - startTime + 100
                // Give us a little bit of leeway for network lag, but not enough to be perceptible
                // TODO: This concern should really be handled elsewhere.
            });
        });
    }

    function setVisualStyle(visualStyle) {
        fixtures.setVisualStyle(visualStyle);
    }

    function close() {
        isRunning = false;
        grid.clear();
        parent.removeChild(grid.view);
    }

    return {
        close: close,
        setInputMethod: setInputMethod,
        setVisualStyle: setVisualStyle,
        gameOver: function(callback) { gameOverCallback = callback; }
    };
};