'use strict';

var arrows = require('../..' + (process.env.SOURCE_ROOT || '') + '/shared/arrows.js');
var assert = require('chai').assert;

describe('arrows', function() {
    var playerArrows;

    beforeEach(function() {
        playerArrows = new arrows.PlayerArrows(4);
    });

    function addArrow(player, x, y, from) {
        return playerArrows.addArrow(player, {
            x: x,
            y: y,
            from: from
        }, from);
    }

    describe('addArrow', function() {
        it('should remove arrows pre-empted by re-instated arrows', function() {
            addArrow(0, 0, 0, 0);
            addArrow(0, 1, 1, 10);
            addArrow(0, 2, 2, 20);
            addArrow(0, 3, 3, 30);
            var arrow = addArrow(1, 0, 0, 35);

            // Check assumptions
            assert.isTrue(!!arrow);
            assert.equal(1, playerArrows.getActiveArrow(40, 0, 0).player);

            addArrow(2, 3, 3, 25);

            assert.equal(0, playerArrows.data[1].length);
        });

        it('should not allow players to place arrows at identical times', function() {
            var firstArrow = addArrow(0, 1, 2, 100);
            var secondArrow = addArrow(1, 2, 3, 100);

            assert.notEqual(firstArrow.from, secondArrow.from);

            var thirdArrow = addArrow(2, 4, 5, 101);
            var fourthArrow = addArrow(0, 6, 7, 102);

            assert.notEqual(thirdArrow.from, fourthArrow.from);
        });
    });
});