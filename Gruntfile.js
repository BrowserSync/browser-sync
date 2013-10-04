'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        nodeunit: {
            files: ['test/**/*_test.js']
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib: {
                src: ['lib/**/*.js']
            },
            test: {
                src: ['test/**/*.js']
            }
        },
        watch: {
            test: {
                files: ['test/**/*.js', 'lib/**/*.js'],
                tasks: ['jasmine_node']
            }
        },
        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                singleRun: true
            }
        },
        jasmine_node: {
            specNameMatcher: "Spec", // load only specs containing specNameMatcher
            projectRoot: "test/new-server",
            requirejs: false,
            forceExit: true,
            jUnit: {
                report: false,
                savePath: "./build/reports/jasmine/",
                useDotNotation: true,
                consolidate: true
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-karma');

    // Default task.
    grunt.registerTask('default', ['jasmine_node']);
    grunt.registerTask('test-all', ['karma:unit', 'jasmine_node']);

};
