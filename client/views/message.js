'use strict';

exports.build = function build(parent) {
    var linkContainer = document.createElement('h4');
    var menuLink = document.createElement('a');
    menuLink.setAttribute('href', '');
    var linkText = document.createTextNode('Return to menu');
    menuLink.appendChild(linkText);
    linkContainer.appendChild(menuLink);
    parent.appendChild(linkContainer);

    var messageContainer = document.createElement('h2');
    var textNode = document.createTextNode('');
    messageContainer.appendChild(textNode);
    parent.appendChild(messageContainer);

    return {
        view: messageContainer,
        setText: function(text) {
            textNode.textContent = text;
        }
    };
};