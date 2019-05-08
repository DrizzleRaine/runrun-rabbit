'use strict';

module.exports = function() {
    var container = document.getElementById('container');
    var gameController = require('../controllers/game.js');
    var banner = require('../../ui/components/banner.js')(container);
    banner.show();

    // Setup model
    var model = {
        menu: true,
        hintMessage: '',
        gameMessage: { text: '' },
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
        startSinglePlayerGame: function(event) {
            hideMenu();
            gameController.init(false, model.options, model.gameMessage);
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

    model.settings = require('../controllers/settings.js')(model.options);
    model.accessibility = require('../controllers/accessibility.js')(model.options);
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
    container.style.display = '';

    // Take new visitors straight to the instructions/settings view
    var newVisitor = !localStorage.visited;
    localStorage.visited = true;
    if (newVisitor) {
        hideMenu();
        model.settings.show();
    }
};