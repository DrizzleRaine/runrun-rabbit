'use strict';

exports.build = function build(parent) {
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