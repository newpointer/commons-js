/**
 * @module utils
 * @desc utils RequireJS-модуль
 * @author ankostyuk
 */
define(function(require, exports, module) {

    require('jquery');
    require('underscore');
    require('dateformat');
    require('session');
    //

    var session = window.session;

    //
    var _Utils = {

        formatNumber: function(number, options, precision) {
            var format = options.format;

            if (_.isNumber(precision)) {
                format = options.format.slice(0);
                format[0] = precision;
            }

            if (!options.humanize.round && format[0] !== 0) {
                var decimals = format[0];

                var d = Math.pow(10, decimals);

                number = Math.round(number * d) / d;

                var numberStr = '' + number;
                var i = numberStr.indexOf('.');
                var fractionalSize = (i >= 0 ? numberStr.substring(i + 1).length : 0);

                if (fractionalSize !== decimals) {
                    format = options.format.slice(0);
                    format[0] = fractionalSize;
                }
            }

            var args = _.union([number], format);

            return _.numberFormat.apply(this, args);
        },

        humanizeNumder: function(number, precision, formatOptions) {
            var numderSizes = formatOptions.numderSizes;

            if (!_.isNumber(number)) {
                return numderSizes[0];
            }

            var i = 1;
            while (number >= 1000 && (i < numderSizes.length - 1)) {
                i++;
                number = number / 1000;
            }

            var nf = _Utils.formatNumber(number, formatOptions, precision);

            return $.trim(nf.replace(/\.0+$/, '') + (numderSizes[i] ? (' ' + numderSizes[i]) : ''));
        },

        isBlankValue: function(value) {
            return (_.isUndefined(value) || _.isNull(value) || _.isNaN(value) || value === '');
        },

        isEmpty: function(value) {
            return _.isEmpty(value);
        },

        getDeltaTime: function(startDate) {
            return (new Date().getTime() - startDate.getTime()) / 1000;
        },

        // @Deprecated
        loadTemplates: function(options) {
            var templates = '';
            $.ajax({
                url: options.url,
                async: options.async,
                cache: options.cache,
                success: function(data){
                    templates = data;
                    options.success.call(options.context ? options.context : this, templates);
                },
                error: function(jqXHR, textStatus, errorThrown){
                    throw 'Templates load error: ' + errorThrown;
                }
            });
        }
    };

    var _StringUtils = {
        findByWords: function(words, queryWords) {
            var findCount = 0;

            $.each(queryWords, function(i, queryWord){
                $.each(words, function(i, word){
                    if (word.indexOf(queryWord) === 0) {
                        findCount++;
                        return false;
                    }
                });
            });

            return (findCount === queryWords.length);
        }
    };

    //
    var _DateUtils = {
        formatDateTime: function(value, format) {
            var date = _.isString(value) ? new Date(Date.parse(value)) : new Date(value);
            return date.format(format ? format : 'dd.mm.yyyy HH:MM');
        }
    };

    //
    var _DOMUtils = {

        window: function() {
            _DOMUtils._window = _DOMUtils._window || $(window);
            return _DOMUtils._window;
        },

        document: function() {
            _DOMUtils._document = _DOMUtils._document || $(document);
            return _DOMUtils._document;
        },

        body: function() {
            _DOMUtils._body = _DOMUtils._body || $('body');
            return _DOMUtils._body;
        },

        getBrowserIdClasses: function() {
            return [
                'browser_'          + session.browser.browser,
                'browser-version_'  + parseInt(session.browser.version), // major version
                'os_'               + session.browser.os
            ].join(' ').toLowerCase();
        },

        isSubElement: function(parentElement, element) {
            return parentElement.is(element) || parentElement.find(element).length;
        },

        attrAsClass: function(element, attr) {
            var sep         = '__',
                add         = '',
                remove      = '',
                attrInfo    = {};

            $.each(attr, function(k, v){
                attrInfo[k] = {
                    pref: k + sep,
                    className: k + sep + v
                };
            });

            $.each((element.attr('class') || '').split(' '), function(i, c){
                $.each(attr, function(k, v){
                    if (c === attrInfo[k].className) {
                        attrInfo[k].change = false;
                        return;
                    } else if (c.indexOf(attrInfo[k].pref) === 0) {
                        remove += (c + ' ');
                        return;
                    }
                });
            });

            $.each(attr, function(k, v){
                if (v !== null && attrInfo[k].change !== false) {
                    add += (attrInfo[k].className + ' ');
                }
            });

            element.removeClass(remove).addClass(add);
        },

        positionDocumentToElement: function(position, element) {
            var offset = element.offset();

            return {
                left: position.left - offset.left,
                top: position.top - offset.top
            };
        },

        getPopupPosition: function(position, element) {
            var width           = element.outerWidth(),
                height          = element.outerHeight(),
                window          = _DOMUtils.window(),
                windowWidth     = window.outerWidth(),
                windowHeight    = window.outerHeight();

            return {
                left: position.left + width < windowWidth ? position.left : position.left - width,
                top: position.top + height < windowHeight ? position.top : position.top - height
            };
        },

        selectOnClick: function($el){
            $el.select();
            // Work around Chrome's little problem
            $el.mouseup(function() {
                $el.unbind("mouseup");
                return false;
            });
        },

        selectContent: function($el){
            var range;
            if (document.selection) {
                range = document.body.createTextRange();
                range.moveToElementText($el[0]);
                range.select();
            } else if (window.getSelection) {
                range = document.createRange();
                range.selectNode($el[0]);
                window.getSelection().addRange(range);
            }
        },

        getCssPosition: function(element){
            var pos = element.css(['left', 'top']);
            $.each(pos, function(p, v) {
                pos[p] = parseInt(v);
            });
            return pos;
        }
    };

    //
    var _HTTPUtils  = {
        getPageBaseUrl: function() {
            var loc = document.location;
            return loc.protocol + '//' + loc.host + loc.pathname;
        }
    };

    //
    var _HTMLUtils  = {
        ctrlHotKeySymbol: session.browser.os === 'Mac' ? '⌘' : 'Ctrl+',
        ctrlHotKey: session.browser.os === 'Mac' ? 'Meta+' : 'Ctrl+'
    };

    // Fix Utils
    $(function() {
        var isIE            = session.browser.browser === 'Explorer',
            documentMode    = document.documentMode;

        var _$document = _DOMUtils.document();

        var _documentInfo = {
            mouse: {
                button: {
                    left: false
                }
            }
        };

        _$document//
            .mousedown(function(e){
                if (e.which === 1) {
                    _documentInfo.mouse.button.left = true;
                }
            })//
            .mouseup(function(e){
                if (e.which === 1) {
                    _documentInfo.mouse.button.left = false;
                }
            })//
            .mousemove(function(e){
                __fixMouseButton(e);
            })//
            .mouseenter(function(e){
                __fixDrag(e);
            })//
            .data('_documentInfo', _documentInfo);

        function __fixMouseButton(e) {
            if (isIE && documentMode < 9 && !event.button) {
                _documentInfo.mouse.button.left = false;
            }

            if (e.which === 1 && !_documentInfo.mouse.button.left) {
                e.which = 0;
            }
        }

        function __fixDrag(e) {
            if (!_documentInfo.mouse.button.left) {
                _$document.trigger('mouseup');
            }
        }
    });

    //
    return {
        Utils: _Utils,
        StringUtils: _StringUtils,
        DateUtils: _DateUtils,
        DOMUtils: _DOMUtils,
        HTTPUtils: _HTTPUtils,
        HTMLUtils: _HTMLUtils
    };
});
