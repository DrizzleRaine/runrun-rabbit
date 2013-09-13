'use strict';

var gameController = require('./controllers/game.js');
var settingsController = require('./controllers/settings.js');

var settingsOpen = false;

var hideMenu = function hideMenu() {
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('backToMenu').classList.remove('hidden');
};

var showMenu = function hideMenu() {
    document.getElementById('menu').classList.remove('hidden');
    document.getElementById('backToMenu').classList.add('hidden');
};

document.getElementById('startSinglePlayer').onclick = function() {
    hideMenu();
    gameController.init(false, settingsController.inputMethod);
};

document.getElementById('startMultiplayer').onclick = function() {
    hideMenu();
    gameController.init(true, settingsController.inputMethod);
};

var openSettings = function() {
    hideMenu();
    settingsController.show();
};

document.getElementById('settingsAndInstructions').onclick = openSettings;

if (!document.cookie) {
    openSettings();
    settingsOpen = true;
}

document.getElementById('backToMenu').onclick = function(event) {
    if (settingsOpen) {
        settingsController.hide();
        showMenu();
        event.preventDefault();
    }
};