'use strict';

var redis = require('redis');

module.exports.createClient = function() {
    return redis.createClient(
        process.env.REDIS_PORT,
        process.env.REDIS_HOST,
        {
            'auth_pass': process.env.REDIS_PASSWORD
        });
};