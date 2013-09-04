'use strict';

exports.build = function build(parent, model) {
    var constants = require('../graphics/constants.js');

    var stage = new PIXI.Stage(constants.COLOURS.BACKGROUND);

    var renderer = PIXI.autoDetectRenderer(model.width * constants.CELL_SIZE, model.height * constants.CELL_SIZE);
    parent.appendChild(renderer.view);

    var grid = require('../graphics/grid.js')(model);
    var fixtures = require('../graphics/fixtures.js')(grid);
    var sprites = require('../graphics/sprites.js')(grid);

    stage.addChild(grid);
    var isRunning = true;

    function animate() {
        if (!isRunning) {
            return;
        }

        while (grid.children.length) {
            grid.removeChild(grid.getChildAt(0));
        }

        model.update();

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

        renderer.render(stage);
        window.requestAnimationFrame(animate);
    }

    window.requestAnimationFrame(animate);

    var clickCallback;

    var offsetX = renderer.view.offsetLeft + (renderer.view.offsetWidth - renderer.view.width) / 2;
    var offsetY = renderer.view.offsetTop + (renderer.view.offsetHeight - renderer.view.height) / 2;

    renderer.view.onmousedown = function(event) {
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
        parent.removeChild(renderer.view);
    }

    return {
        click: function(callback) { clickCallback = callback; },
        close: close
    };
};