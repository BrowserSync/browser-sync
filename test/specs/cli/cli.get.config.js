"use strict";

var index        = require("../../../lib/index");
var messages     = require("../../../lib/messages");
var loadedConfig = require("../../../lib/default-config");
var info         = require("../../../lib/cli-info");

var _            = require("lodash");
var sinon        = require("sinon");
var assert       = require("chai").assert;

var configFilePath = "test/fixtures/config/si-config.js";


describe("Resolving Config:", function () {

    var defaultConfig;

    beforeEach(function(){
        defaultConfig = _.cloneDeep(loadedConfig);
    });

    describe("When retrieving the bs-config.js file", function () {
        var getFileStub;
        var cwdStub;
        before(function () {
            getFileStub = sinon.stub(info, "_getConfigFile").returns({});
            cwdStub = sinon.stub(process, "cwd").returns("/Users/shakyshane/os-browser-sync");
        });
        after(function () {
            getFileStub.restore();
            cwdStub.restore();
        });
        it("should call get config file.", function () {
            var expected = "/Users/shakyshane/os-browser-sync" + messages.configFile;
            info._getDefaultConfigFile();
            sinon.assert.calledWithExactly(getFileStub, expected);
        });
    });

    describe("reading a config file from the file system", function () {

        it("can false if the file is not found", function () {
            var files = info._getConfigFile("random/file/doesn'tex");
            assert.isFalse(files);
        });

        it("does not throw if the file is found", function () {
            assert.isDefined(info._getConfigFile(configFilePath));
        });
    });
});
