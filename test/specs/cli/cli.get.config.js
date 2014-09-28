"use strict";

var loadedConfig = require("../../../lib/default-config");
var info         = require("../../../lib/cli/cli-info");

var _            = require("lodash");
var assert       = require("chai").assert;

var configFilePath = "test/fixtures/config/si-config.js";

describe("CLI: Resolving Config file:", function () {

    var defaultConfig;

    beforeEach(function () {
        defaultConfig = _.cloneDeep(loadedConfig);
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
