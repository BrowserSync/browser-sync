"use strict";

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
            files: ["test/**/*_test.js"]
        },
        uglify: {
            clientScript: {
                files: {
                    "lib/client/browser-sync-client.min.js": "lib/client/browser-sync-client.js"
                }
            }
        },
        jshint: {
            gruntfile: {
                options: {
                    jshintrc: ".jshintrc"
                },
                src: "Gruntfile.js"
            },
            lib: {
                options: {
                    jshintrc: ".jshintrc"
                },
                src: ["lib/**/*.js", "!lib/client/browser-sync-client.min.js"]
            },
            test: {
                options: {
                    jshintrc: "test/.jshintrc"
                },
                src: ["test/server/**/*.js", "test/client-script/**/*.js", "!test/client-script/libs/**/*"]
            }
        },
        watch: {
            test: {
                files: ["test/**/*.js", "lib/**/*.js"],
                tasks: ["jasmine_node"]
            },
            sass: {
                files: ["test/fixtures/scss/bootstrap.scss"],
                tasks: ["sass"]
            },
            less: {
                files: ["test/fixtures/less/bootstrap.less"],
                tasks: ["less"]
            },
            jshint: {
                files: [
                    "lib/**/*.js",
                    "!lib/*.min.js",
                    "test/server/**/*.js",
                    "test/client-script/**/*.js",
                    "!test/client-script/libs"
                ],
                tasks: ["jshint:test"]
            }
        },
        karma: {
            unit: {
                configFile: "test/karma.conf.js",
                singleRun: true
            },
            watch: {
                configFile: "test/karma.conf.js",
                singleRun: false
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: "spec"
                },
                src: ["test/server/**/*.js"]
            }
        },
        shell: {
            github: {
                command: "git push origin master",
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
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("grunt-karma");
    grunt.loadNpmTasks("grunt-shell");

    // Tests
    grunt.registerTask("test:server", ["jshint", "mochaTest"]);
    grunt.registerTask("test:client", ["jshint", "karma:unit"]);
    grunt.registerTask("test", ["jshint", "karma:unit", "mochaTest"]);

    grunt.registerTask("release:github", ["jshint", "karma:unit", "mochaTest", "shell:github"]);
};
