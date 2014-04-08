'use strict';

var RNG = require('../../shared/utils/rng.js').RNG;

var bases = require('bases');
var random = new RNG();
var alphabet = '2345689bcdfghjmnpqrvwxz';
var MIN_VALUE = Math.pow(alphabet.length, 2);
var MAX_VALUE = Math.pow(alphabet.length, 5);

var MIN_LENGTH = module.exports.MIN_LENGTH = 2;
var MAX_LENGTH = module.exports.MAX_LENGTH = 20;

module.exports.generate = function() {
    return 'User_' + bases.toAlphabet(random.inRange(MIN_VALUE, MAX_VALUE), alphabet);
};

module.exports.validate = function validateUsername(username) {
    if (!username) {
        return 'Please specify a username';
    } else if (username.length < MIN_LENGTH) {
        return 'Please specify a username at least two characters long';
    } else if (username.length > MAX_LENGTH) {
        return 'Please specify a username no more than twenty characters long';
    }
};