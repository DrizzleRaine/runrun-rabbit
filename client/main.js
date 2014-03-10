'use strict';

var container = document.getElementById('container');
var gameController = require('./controllers/game.js');
var banner = require('./views/banner.js')(container);
banner.show();

// Setup model
var model = {
    menu: true,
    hintMessage: '',
    options: {},
    returnToMenu: function (event) {
        model.optionsControllers.forEach(function(controller) {
            if (controller.open) {
                controller.hide();
                showMenu();
                event.preventDefault();
            }
        });
    },
    showController: function (event) {
        hideMenu();
        model[this.getAttribute('data-controller')].show();
        event.preventDefault();
    },
    startGame: function(event) {
        hideMenu();
        gameController.init(this.getAttribute('value') === 'true', model.options);
        event.preventDefault();
    }
};

function showMenu() {
    model.menu = true;
    banner.show();
}

function hideMenu() {
    model.menu = false;
    banner.hide();
}

model.settings = require('./controllers/settings.js')(model.options);
model.accessibility = require('./controllers/accessibility.js')(model.options);
model.optionsControllers = [model.settings, model.accessibility];

// Data-bind model and view
var rivets = require('rivets');
rivets.configure({
    prefix: 'data'
});
rivets.bind(container, model, {
    binders: {
        'hint-text': {
            bind: function(element) {
                element.onmouseover = function() { model.hintMessage = element.getAttribute('data-hint-text'); };
                element.onmouseout = function() { model.hintMessage = ''; };
            }
        }
    }
});

// Take new visitors straight to the instructions/settings view
var newVisitor = !localStorage.visited;
localStorage.visited = true;
if (newVisitor) {
    model.hideMenu();
    model.settings.show();
}