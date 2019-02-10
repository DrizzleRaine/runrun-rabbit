'use strict';

module.exports.createClient = function() {
    if (process.env.REDIS) {
        // Production server with single env variable (e.g. Heroku)
        return require('redis').createClient(
            process.env.REDIS
        );
    } else if (process.env.REDIS_HOST) {
        // Production server
        return require('redis').createClient(
            process.env.REDIS_PORT,
            process.env.REDIS_HOST,
            {
                'auth_pass': process.env.REDIS_PASSWORD
            });
    } else {
        // Local server or test runner
        return require('node-redis-mock').createClient();
    }
};