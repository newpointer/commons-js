//
module.exports = function(grunt) {

    var testServerPort = 9000;

    grunt.initConfig({
        clean: ['node_modules', 'bower_components', 'lib'],

        bower: {
            install: {
                options: {
                    targetDir: './lib',
                    layout: 'byComponent',
                    install: true,
                    verbose: true,
                    cleanTargetDir: true,
                    cleanBowerDir: false,
                    bowerOptions: {
                        forceLatest: true,
                        production: false
                    }
                }
            }
        },

        connect: {
            'test-server': {
                options: {
                    port: testServerPort,
                    base: '.'
                }
            }
        },

        shell: {
            'all-tests': {
                command: 'node_modules/mocha-phantomjs/bin/mocha-phantomjs -R spec http://localhost:' + testServerPort + '/test/test.html',
                options: {
                    failOnError: true,
                    stdout: true,
                    stderr: true
                }
            }
        },

        jshint: {
            options: {
                force: true,
                browser: true,
                ignores: [
                    'src/lodash/lodash.js',
                    'src/lodash/underscore.string.js'
                ],
                '-W069': true
            },
            src: ['src/**/*.js']
        },

        copy: {
            dist: {
                expand: true,
                cwd: 'src/',
                src: ['**/*.js'],
                dest: 'dist/'
            },
            docs: {
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('init', ['bower']);
    grunt.registerTask('all-tests', ['connect', 'shell:all-tests']);
    grunt.registerTask('test', ['all-tests']);
    grunt.registerTask('build', ['bower', 'jshint', 'test']);

    grunt.registerTask('dist', ['build', 'copy:dist', 'copy:docs']);
};
