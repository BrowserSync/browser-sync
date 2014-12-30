"use strict";

var info           = require("../../../lib/cli/cli-info");
var assert         = require("chai").assert;

describe("When reading a config file from the file system", function () {

    it("should throw if the file is not found", function () {
        assert.throws(function () {
            info.getConfigFile("random/file/doesn'texist");
        });
    });

    it("should not throw if the file is found", function () {
        assert.isDefined(info.getConfigFile("test/fixtures/config/si-config.js"));
    });
});
