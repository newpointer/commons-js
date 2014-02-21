// utils test
define(function(require) {'use strict';
    var chai        = require('chai'),
        assert      = chai.assert,
        expect      = chai.expect,
        should      = chai.should();

                      require('jquery');
    //
    var utils       = require('utils'),
        HTTPUtils   = utils.HTTPUtils;

    //
    describe('utils test...', function() {

        describe('HTTP Utils', function() {
            it('getPageBaseUrl', function(){
                var pageBaseUrl = HTTPUtils.getPageBaseUrl();
                console.log(pageBaseUrl);
            })
        })
    })
});
