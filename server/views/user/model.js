'use strict';

var gravatar = require('gravatar');

module.exports.create = function (user) {
    var viewModel = Object.create(user);
    viewModel.avatar = function(size) {
        return gravatar.url(user.gravatar || '', { d: 'mm', s: size });
    };

    return viewModel;
};