'use strict';

///var userRepoFactory = require('../repositories/user.js');

module.exports = function() {
    //var userRepo = userRepoFactory.build();

    return {
        '/user': {
            '/details': {
                get: function(req, res) {
                    res.sendFile('details.html', {root: __dirname + '/../views/user'});
                }
            }
        }
    };
};