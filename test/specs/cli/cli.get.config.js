"use strict";

var index        = require("../../../lib/index");
var config       = require("../../../lib/config");
var loadedConfig = require("../../../lib/default-config");
var info         = require("../../../lib/cli-info");

var _            = require("lodash");
var sinon        = require("sinon");
var assert       = require("chai").assert;

var configFilePath = "test/fixtures/config/si-config.js";
var fakeCwd = "/Users/shakyshane/os-browser-sync";


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
            cwdStub = sinon.stub(process, "cwd").returns(fakeCwd);
        });
        after(function () {
            getFileStub.restore();
            cwdStub.restore();
        });
        it("should call '_getConfigFile' with the default path", function () {
            var expected = fakeCwd + config.configFile;
            info.getDefaultConfigFile();
            sinon.assert.calledWithExactly(getFileStub, expected);
        });
    });

    describe("When reading a config file from the file system", function () {

        it("should return false if the file is not found", function () {
            var files = info._getConfigFile("random/file/doesn'texist");
            assert.isFalse(files);
        });

        it("should not throw if the file is found", function () {
            assert.isDefined(info._getConfigFile(configFilePath));
        });
    });
});
