var buttonClass = ['primary', 'success'];

exports.build = function build(parent, player) {
    var graphics = require('../graphics/hud.js');
    var constants = require('../graphics/constants.js');

    var doneCallback;

    var stage = new PIXI.Stage(0xFFFFFF);
    var renderer = new PIXI.CanvasRenderer(144, 144);

    var timer = new graphics.Timer(constants.COLOURS.PLAYER[player], 144);
    stage.addChild(timer);

    var hudDiv = $('<div class="hud" id="hud-' + player + '"></div>');

    var doneButton = $('<button type="button" class="btn btn-lg btn-' + buttonClass[player] + '">Done</button>');
    hudDiv.append(doneButton);

    hudDiv.append($('<h2>Score:</h2>'));

    var score = $('<h3 class="score"></h3>');
    hudDiv.append(score);

    hudDiv.append($('<h2>Time:</h2>'));
    var nativeElement = hudDiv[0];
    nativeElement.appendChild(renderer.view);

    parent.appendChild(nativeElement);

    doneButton.click(function() {
        if (doneCallback) {
            doneCallback();
        }
    });

    function update(stats) {
        score.text(stats.score);
        timer.update(stats.time);
        window.requestAnimationFrame(function() { renderer.render(stage); });
    }

    return {
        done: function(callback) { doneCallback = callback; },
        update: update
    }

};