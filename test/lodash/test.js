// lodash test
define(function(require) {'use strict';
    var chai        = require('chai'),
        assert      = chai.assert,
        expect      = chai.expect,
        should      = chai.should();

    //
    require('lodash');

    //
    describe('lodash test...', function() {
        it('global _', function(){
            assert.isFunction(_);

            console.log('lodash version:', _.VERSION);
            assert.isString(_.VERSION);
            assert.ok(_.VERSION);
        })
    })

    //
    describe('default package settings...', function() {
        it('templateSettings', function(){
            assert.deepEqual(_.templateSettings, {
                evaluate:       /\{%([\s\S]+?)%\}/g,
                interpolate:    /\{%=([\s\S]+?)%\}/g,
                escape:         /\{%-([\s\S]+?)%\}/g
            });
        })
    })

    //
    describe('lodash + underscore.string test...', function() {
        it('mixin', function(){
            // prune
            assert.strictEqual(_.prune('Hello, world', 5), 'Hello...');

            // sprintf
            assert.strictEqual(_.sprintf('%.1f', 1.17), '1.2');

            // toSentence
            assert.strictEqual(_.toSentence(['jQuery', 'Mootools', 'Prototype']), 'jQuery, Mootools and Prototype');

            // words
            assert.deepEqual(_.words('I-love-you', /-/), ['I', 'love', 'you']);
        })
    })
});
