'use strict';

var controller = require('./controller.js');

var hideMenu = function hideMenu() {
    document.getElementById('menu').classList.add('hidden');
};

document.getElementById('startSinglePlayer').onclick = function() {
    hideMenu();
    controller.init(false);
};

document.getElementById('startMultiplayer').onclick = function() {
    hideMenu();
    controller.init(true);
};