/**
 * @module template-utils
 * @desc template-utils RequireJS-модуль
 * @author ankostyuk
 */
define(function(require) {'use strict';

                          require('lodash');
                          require('jquery');
    var i18n            = require('i18n');
    //

    function processTemplate(template) {
        var translatedTemplate = i18n.translateTemplate(template),
            templates           = {};

        // templates
        $(translatedTemplate).each(function(){
            var $template   = $(this),
                tid         = $template.attr('id');

            if (tid) {
                templates[tid] = {
                    html: $template.html(),
                    'class': $template.attr('data-class'),
                    'parent-class': $template.attr('data-parent-class')
                };
            }
        });

        // include process
        var compileSettings = {
            escape: '',
            evaluate: '',
            interpolate: /\{%=([\s\S]+?)%\}/g
        };

        var compileHelper = {
            include: function(templateId){
                return templates[templateId].html;
            }
        };

        _.each(templates, function(t){
            t.html = _.template(t.html, compileSettings)(compileHelper);
        });

        // API
        return {
            translatedTemplate: translatedTemplate,
            templates: templates
        };
    }

    //
    return {
        processTemplate: processTemplate
    };
});
