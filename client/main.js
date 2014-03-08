'use strict';

var newVisitor = !localStorage.visited;
localStorage.visited = true;

var gameController = require('./controllers/game.js');
var hintMessage = require('./views/message.js').build(document.getElementById('container'), 'menuHint');
var banner = require('./views/banner.js')(document.getElementById('container'));
banner.show();

var options = {};
var settings = require('./controllers/settings.js')(options);
var accessibility = require('./controllers/accessibility.js')(options);
var optionsControllers = [settings, accessibility];

var hideMenu = function hideMenu() {
    document.getElementById('menu').classList.add('hidden');
    hintMessage.view.classList.add('hidden');
    document.getElementById('backToMenu').classList.remove('hidden');
    banner.hide();
};

var showMenu = function showMenu() {
    document.getElementById('menu').classList.remove('hidden');
    hintMessage.view.classList.remove('hidden');
    document.getElementById('backToMenu').classList.add('hidden');
    banner.show();
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

setupHintMessage('accessibilityOptions',
    'Configure display options for accessibility, and audio volumes');

document.getElementById('startSinglePlayer').onclick = function() {
    hideMenu();
    gameController.init(false, options);
};

document.getElementById('startMultiplayer').onclick = function() {
    hideMenu();
    gameController.init(true, options);
};

var openController = function(controller) {
    hideMenu();
    controller.show();
};

document.getElementById('settingsAndInstructions').onclick = function() { openController(settings); };
document.getElementById('accessibilityOptions').onclick = function() { openController(accessibility); };

if (newVisitor) {
    openController(settings);
}

function returnToMenu(event) {
    optionsControllers.forEach(function(controller) {
        if (controller.open) {
            controller.hide();
            showMenu();
            event.preventDefault();
        }
    });
}

document.getElementById('backToMenu').onclick = returnToMenu;
document.getElementById('startPlaying').onclick = returnToMenu;