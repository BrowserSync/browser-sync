'use strict';

var module = require('../../lib/index');
var setup = module.setup;
var configFilePath = "test/fixtures/si-config.js";

var file1 = "test/fixtures/scss/main.scss";
var file2 = "test/fixtures/assets/style.css";


var defaultConfig = {
    debugInfo: true,
    files: file2,
    background: false,
    defaultConfig: true,
    reloadFileTypes: ['php', 'html', 'js', 'erb'],
    injectFileTypes: ['css', 'png', 'jpg', 'svg', 'gif'],
    host: null,
    ghostMode: {
        links: false,
        forms: false,
        scroll: false
    },
    server: {
        baseDir: "./"
    },
    open: true
};

describe("Style Injector: accepting a config file.", function () {

    describe("When a config arg is given on command line", function () {

        var argv = {};
        beforeEach(function(){
        });

        it("should return the default config if no argv provided", function () {

            var config = setup.getConfig(defaultConfig, argv);
            expect(config.defaultConfig).toBe(true);
        });

        it("should accept that file instead of anything else", function () {

            argv.config = configFilePath;
            var config = setup.getConfig(defaultConfig, argv);
            expect(config.testConfig).toBe(true);
        });
    });

    describe("reading a file from the file system", function () {

        it("can throw an error if the file is not found", function () {
            var files= setup._getConfigFile("random/file/doesn'tex");
            expect(files).toBe(false);
        });

        it("does not throw if the file is found", function () {
            expect(setup._getConfigFile(configFilePath)).not.toBe(false);
        });
    });

    describe("extracting the files arg from the config file", function () {

        it("can choose files arg from command line when given", function () {

            var argv = {
                files: file1
            };

            var filesArg = setup.getFilesArg(argv, defaultConfig);

            expect(filesArg).toBe(file1);
        });
        it("can return the files arg from default config if no command provided", function () {

            var argv = {}; // no command-line args
            var filesArg = setup.getFilesArg(argv, defaultConfig);

            expect(filesArg).toBe(file2);

        });
    });
});
