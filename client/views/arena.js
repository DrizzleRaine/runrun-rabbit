'use strict';

module.exports = function build(parent, model, placeArrowCallback) {
    var grid = require('../graphics/grid.js')(model);
    var fixtures = require('../graphics/fixtures.js')(grid);
    var sprites = require('../graphics/sprites.js')(grid);

    parent.appendChild(grid.view);

    var isRunning = true;
    var startTime = new Date().getTime();

    function animate() {
        model.update(new Date().getTime() - startTime);

        if (!model.isRunning) {
            close();
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

        model.critters.forEach(function(critter) {
            sprites.drawCritter(critter);
        });

        window.requestAnimationFrame(animate);
    }

    window.requestAnimationFrame(animate);

    require('./input.js')(grid.view, function(x, y, direction) {
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

    function close() {
        isRunning = false;
        parent.removeChild(grid.view);
    }

    return {
        close: close
    };
};