require.config({
    baseUrl: '/',

    paths: {
        // path to src
        'utils':   'src/utils/utils',

        // path to src dependencies files
        'jquery':       'lib/jquery/jquery',

        'dateformat':   'lib/dateformat/index',
        'iso8601':      'lib/iso8601/iso8601',

        'session':      'lib/session.js/session',

        // path to src dev dependencies files

        // paths to test-framework files
        'mocha':        'node_modules/mocha/mocha',
        'chai':         'node_modules/chai/chai',

        // paths to test files
        'lodash.test':  'test/lodash/test',
        'utils.test':   'test/utils/test'
    },
    packages: [{
        name: 'lodash',
        location: 'src/lodash'
    }]
});

define(function(require) {
    require('mocha');

    mocha.setup('bdd');

    require(['lodash.test', 'utils.test'], function() {
        if (window.mochaPhantomJS) {
            mochaPhantomJS.run();
        } else {
            mocha.run();
        }
    });
});
