"use strict";

var index = require("../../lib/index");
var dConfig = require("../fixtures/si-default-config");
var _ = require("lodash");
var assert = require("chai").assert;
var setup = index.setup;

var configFilePath = "test/fixtures/si-config.js";
var partialConfigFilePath = "test/fixtures/si-config-partial.js";

var file1 = "test/fixtures/scss/main.scss";
var file2 = "test/fixtures/assets/style.css";

var defaultConfig;

describe("Style Injector: accepting a config file.", function () {

    beforeEach(function(){
        // reset default config before every test
        defaultConfig = _.cloneDeep(dConfig);
    });


    describe("When a config arg is given on command line", function () {

        var argv = {};
        beforeEach(function(){
        });

        it("should return the default config if no argv provided", function () {

            var config = setup.getConfig(defaultConfig, argv);
            assert.isTrue(config.defaultConfig);
        });

        it("should accept that file instead of anything else", function () {

            argv.config = configFilePath;
            var config = setup.getConfig(defaultConfig, argv);
            assert.isTrue(config.testConfig);
        });
    });

    describe("reading a file from the file system", function () {

        it("can throw an error if the file is not found", function () {
            var files= setup._getConfigFile("random/file/doesn'tex");
            assert.isFalse(files);
        });

        it("does not throw if the file is found", function () {
            assert.isDefined(setup._getConfigFile(configFilePath));
        });
    });

    describe("extracting the files arg from the config file", function () {

        it("can choose files arg from command line when given", function () {

            var argv = {
                files: file1
            };

            var filesArg = setup.getFilesArg(argv, defaultConfig);
            assert.equal(filesArg, file1);
        });
        it("can return the files arg from default config if no command provided", function () {

            var argv = {};

            var filesArg = setup.getFilesArg(argv, defaultConfig);
            assert.equal(filesArg, file2);

        });
    });

    describe("merging any given config options with the defaults", function () {

        it("can merge all default config options if not provided in user config", function () {

            var argv = {};

            argv.config = partialConfigFilePath;

            var config = setup.getConfig(defaultConfig, argv);

            assert.isDefined(config.ghostMode);
            assert.isDefined(config.open);
            assert.isDefined(config.reloadFileTypes);
            assert.isDefined(config.injectFileTypes);
            assert.isDefined(config.background);
            assert.isDefined(config.debugInfo);
            assert.isDefined(config.host);
            assert.isDefined(config.server);
        });
        it("can accept the INDEX option on the command line", function () {

            var argv = {
                index: "index.htm",
                server: true
            };

            var config = setup.getConfig(defaultConfig, argv);
            assert.equal(config.server.index, "index.htm");

        });
    });
});
