var controller = require('./controller.js');

$(document).ready(function() {
    $('#startSinglePlayer').click(function() {
        $('#menu').hide();
        controller.init(false);
    });

    $('#startMultiplayer').click(function() {
        $('#menu').hide();
        controller.init(true);
    });
});

