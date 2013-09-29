'use strict';

exports.build = function build(parent, cssClass) {
    var messageContainer = document.createElement('h2');
    var textNode = document.createTextNode('');
    messageContainer.appendChild(textNode);
    messageContainer.classList.add('message');
    if (cssClass) {
        messageContainer.classList.add(cssClass);
    }
    parent.appendChild(messageContainer);

    return {
        view: messageContainer,
        setText: function(text) {
            textNode.textContent = text;
        }
    };
};