'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        dirs: {
            assets: "test/fixtures",
            css: "<%= dirs.assets %>/css",
            less: "<%= dirs.assets %>/less",
            scss: "<%= dirs.assets %>/scss",
            stylus: "<%= dirs.assets %>/stylus"
        },
        nodeunit: {
            files: ['test/**/*_test.js']
        },
        uglify: {
            client_script: {
                files: {
                    'lib/browser-sync-client.min.js': 'lib/browser-sync-client.js'
                }
            }
        },
        jshint: {
            gruntfile: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: 'Gruntfile.js'
            },
            lib: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: ['lib/**/*.js', '!lib/browser-sync-client.min.js']
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/**/*.js']
            }
        },
        watch: {
            test: {
                files: ['test/**/*.js', 'lib/**/*.js'],
                tasks: ['jasmine_node']
            },
            sass: {
                files: ['test/fixtures/scss/bootstrap.scss'],
                tasks: ['sass']
            },
            less: {
                files: ['test/fixtures/less/bootstrap.less'],
                tasks: ['less']
            }
        },
        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                singleRun: true
            },
            watch: {
                configFile: 'test/karma.conf.js',
                singleRun: false
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
        },
        shell: {
            github: {
                command: 'git push origin master',
                options: {
                    stdout: true
                }
            }
        },
        /**
         *
         *
         * Fixture stuff
         *
         */
        less: {
            development: {
                files: {
                    "<%= dirs.css %>/bootstrap-less.css": "<%= dirs.less %>/bootstrap.less"
                }
            }
        },
        stylus: {
            development: {
                files: {
                    "<%= dirs.css %>/bootstrap-stylus.css": "<%= dirs.stylus %>/bootstrap.styl"
                }
            }
        },
        sass: {
            development: {
                files: {
                    "<%= dirs.css %>/bootstrap-scss.css": "<%= dirs.scss %>/bootstrap.scss"
                }
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-shell');

    // Tests
    grunt.registerTask('default', ['jasmine_node']);
    grunt.registerTask('test:server', ['jshint', 'jasmine_node']);
    grunt.registerTask('test:client', ['jshint', 'karma:unit']);
    grunt.registerTask('test', ['jshint', 'karma:unit', 'jasmine_node']);

    grunt.registerTask('release:github', ['jshint', 'karma:unit', 'jasmine_node', 'shell:github']);
};
