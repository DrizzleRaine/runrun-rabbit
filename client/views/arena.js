'use strict';

exports.build = function build(parent, model) {
    var constants = require('../graphics/constants.js');
    var grid = require('../graphics/grid.js')(model);
    var fixtures = require('../graphics/fixtures.js')(grid);
    var sprites = require('../graphics/sprites.js')(grid);
    parent.appendChild(grid.view);

    var isRunning = true;

    function animate() {
        if (!isRunning) {
            return;
        }

        model.update();

        grid.clear();

        model.playerArrows.forEach(function(playerArrows, player) {
            playerArrows.forEach(function(arrow) {
                fixtures.drawArrow(player, arrow);
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

    var clickCallback;

    var offsetX = grid.view.offsetLeft + (grid.view.offsetWidth - grid.view.width) / 2;
    var offsetY = grid.view.offsetTop + (grid.view.offsetHeight - grid.view.height) / 2;

    grid.view.onmousedown = function(event) {
        if (!clickCallback) {
            return;
        }

        var cell = {};

        cell.x = Math.floor((event.clientX - offsetX) / constants.CELL_SIZE);
        cell.y = Math.floor((event.clientY - offsetY) / constants.CELL_SIZE);

        clickCallback(cell);
    };

    function close() {
        isRunning = false;
        parent.removeChild(grid.view);
    }

    return {
        click: function(callback) { clickCallback = callback; },
        close: close
    };
};