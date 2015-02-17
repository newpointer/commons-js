/**
 * @module main.js
 * @desc RequireJS lodash package main module
 * @author ankostyuk
 */
define(function(require) {'use strict';
    //
    var _   = require('./lodash'),
        _s  = require('./underscore.string');

    // lodash settings
    _.templateSettings = {
        evaluate:       /\{%([\s\S]+?)%\}/g,
        interpolate:    /\{%=([\s\S]+?)%\}/g,
        escape:         /\{%-([\s\S]+?)%\}/g
    };

    // lodash + underscore.string
    _.mixin(_s.exports());

    return _;
});
