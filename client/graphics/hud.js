module.exports.Timer = function Timer(colour, unit) {
    var background = 0xFFFFFF;

    var graphics = new PIXI.Graphics();

    function update(millis) {
        graphics.clear();
        while (graphics.children.length) {
            graphics.removeChild(graphics.getChildAt(0));
        }

        var seconds = millis / 1000;
        var number = Math.ceil(seconds);
        var remainder = seconds % 1;

        if (seconds > 0) {
            graphics.beginFill(colour, 1);
            graphics.drawCircle(unit / 2, unit / 2, unit /2);
            graphics.lineStyle(unit / 24, background, 1);
            graphics.moveTo(unit / 2, 0);
            graphics.lineTo(unit / 2, unit);
            graphics.moveTo(0, unit / 2);
            graphics.lineTo(unit, unit/ 2);
            graphics.lineStyle();
            graphics.beginFill(background, 1);
            graphics.drawCircle(unit / 2, unit / 2, unit * 3 / 8);

            if (remainder < 0.75) {
                graphics.drawRect(unit / 2, 0, unit / 2, unit / 2);
            }
            if (remainder < 0.5) {
                graphics.drawRect(unit / 2, unit / 2, unit / 2, unit / 2);
            }
            if (remainder < 0.25) {
                graphics.drawRect(0, unit / 2, unit / 2, unit / 2);
            }
        }

        var text = new PIXI.Text(number.toString(), {
            font: 'normal ' + Math.round(unit / 4) + 'pt "Open Sans", Calibri, Candara, Arial, sans-serif',
            align: 'center'
        });

        text.anchor.x = 0.5;
        text.anchor.y = 0.5;

        text.position.x = unit / 2;
        text.position.y = unit / 2;

        graphics.addChild(text);
    }

    graphics.update = update;
    return graphics;
};