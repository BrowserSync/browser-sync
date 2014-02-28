"use strict";

var index = require("../../../lib/index");
var messages = require("../../../lib/messages");
var dConfig = require("../../../lib/default-config");
var _ = require("lodash");
var sinon = require("sinon");
var assert = require("chai").assert;
var cliUtils = require("../../../lib/cli").utils;

var configFilePath = "test/fixtures/config/si-config.js";
var partialConfigFilePath = "test/fixtures/config/si-config-partial.js";

var file1 = "test/fixtures/scss/main.scss";
var file2 = "test/fixtures/assets/style.css";

var defaultConfig;

describe("INIT: accepting a config file.", function () {

    beforeEach(function(){
        defaultConfig = _.cloneDeep(dConfig);
    });

    describe("Getting default Config from command-line", function () {
        var argv = {};
        var getFileStub;
        var cwdStub;
        var expected;
        before(function () {
            getFileStub = sinon.stub(cliUtils, "_getConfigFile").returns({});
            cwdStub = sinon.stub(process, "cwd").returns("/app");
            expected = "/app" + messages.configFile;
        });
        after(function () {
            getFileStub.restore();
            cwdStub.restore();
        });
        it("can retrieve the default config if it exists", function () {
            var actual = cliUtils._getDefaultConfigFile();
            sinon.assert.calledWithExactly(getFileStub, expected);
        });
    });


    describe("Using the Default config when file found from command-line E2E", function () {

        var defaultStub;
        var argv;
        var getFileStub;
        before(function () {
            argv = {};
            defaultStub = sinon.stub(cliUtils, "_getDefaultConfigFile").returns({server: true});
        });
        afterEach(function () {
            defaultStub.reset();
        });
        after(function () {
            defaultStub.restore();
        });
        it("should call _getDefaultConfigFile", function () {
            var actual = cliUtils.getConfig(defaultConfig, argv);
            sinon.assert.calledOnce(defaultStub);
        });
        it("should merge the default config when found", function () {
            var actual = cliUtils.getConfig(defaultConfig, argv);
            assert.isTrue(actual.server);
        });
        it("should merge the default config when found", function () {
            var actual = cliUtils.getConfig(defaultConfig, argv);
            assert.isTrue(actual.server);
        });
    });

    describe("Using a file given on command line even when default exists", function () {

        var defaultStub;
        var argv;
        var getFileStub;
        before(function () {
            argv = {
                config: "path/to/config"
            };
            defaultStub = sinon.stub(cliUtils, "_getDefaultConfigFile").returns({server: true}); //default found
            getFileStub = sinon.stub(cliUtils, "_getConfigFile").returns({server: false});
        });
        afterEach(function () {
            defaultStub.reset();
            getFileStub.reset();
        });
        after(function () {
            defaultStub.restore();
            getFileStub.restore();
        });
        it("should use the config file given instead of the default", function () {
            var actual = cliUtils.getConfig(defaultConfig, argv);
            assert.isFalse(actual.server);
        });
    });




    describe("When a config arg is given on command line", function () {

        var argv = {};
        beforeEach(function(){
        });

        it("should return the default config if no argv provided", function () {

            var config = cliUtils.getConfig(defaultConfig, argv);
            assert.equal(config, defaultConfig);
        });

        it("should accept that file instead of anything else", function () {

            argv.config = configFilePath;
            var config = cliUtils.getConfig(defaultConfig, argv);
            assert.isTrue(config.testConfig);
        });
    });

    describe("reading a config file from the file system", function () {

        it("can false if the file is not found", function () {
            var files= cliUtils._getConfigFile("random/file/doesn'tex");
            assert.isFalse(files);
        });

        it("does not throw if the file is found", function () {
            assert.isDefined(cliUtils._getConfigFile(configFilePath));
        });
    });

    describe("extracting the files arg from the config file", function () {

        it("can choose files arg from command line when given", function () {
            var argv = {
                files: file1
            };
            var filesArg = cliUtils.getFilesArg(argv, defaultConfig);
            assert.equal(filesArg, file1);
        });
        it("can return the files arg from default config if no command provided", function () {
            var argv = {};
            var filesArg = cliUtils.getFilesArg(argv, defaultConfig);
            assert.isNull(filesArg);
        });
    });

    describe("merging any given config options with the defaults", function () {

        it("can merge all default config options if not provided in user config", function () {

            var argv = {};

            argv.config = partialConfigFilePath;

            var config = cliUtils.getConfig(defaultConfig, argv);

            assert.isDefined(config.ghostMode);
            assert.isDefined(config.open);
            assert.isDefined(config.injectFileTypes);
            assert.isDefined(config.debugInfo);
            assert.isDefined(config.host);
            assert.isDefined(config.server);
        });
        it("can accept the INDEX option on the command line", function () {

            var argv = {
                index: "index.htm",
                server: true
            };

            var config = cliUtils.getConfig(defaultConfig, argv);
            assert.equal(config.server.index, "index.htm");

        });
    });
});
