'use strict';

var newVisitor = !document.cookie;

var gameController = require('./controllers/game.js');
var settingsController = require('./controllers/settings.js');
var hintMessage = require('./views/message.js').build(document.getElementById('container'));

var settingsOpen = false;

var hideMenu = function hideMenu() {
    document.getElementById('menu').classList.add('hidden');
    hintMessage.view.classList.add('hidden');
    document.getElementById('backToMenu').classList.remove('hidden');
};

var showMenu = function showMenu() {
    document.getElementById('menu').classList.remove('hidden');
    hintMessage.view.classList.remove('hidden');
    document.getElementById('backToMenu').classList.add('hidden');
};

function setupHintMessage(elementId, message) {
    var element = document.getElementById(elementId);
    element.onmouseover = function() { hintMessage.setText(message); };
    element.onmouseout = function() { hintMessage.setText(''); };
}

setupHintMessage('startSinglePlayer',
    'Start a single player game against a computer-controlled opponent');

setupHintMessage('startMultiplayer',
    'Start a multiplayer game against a randomly chosen human opponent');

setupHintMessage('settingsAndInstructions',
    'View instructions and configure input options');

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
    settingsOpen = true;
    settingsController.show();
};

document.getElementById('settingsAndInstructions').onclick = openSettings;

if (newVisitor) {
    openSettings();
}

document.getElementById('backToMenu').onclick = function(event) {
    if (settingsOpen) {
        settingsController.hide();
        settingsOpen = false;
        showMenu();
        event.preventDefault();
    }
};