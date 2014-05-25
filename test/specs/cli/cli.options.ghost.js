"use strict";

var defaultConfig   = require("../../../lib/default-config");
var cli             = require("../../../lib/cli");
var options         = cli.options;
var callbacks       = options.callbacks;

var assert = require("chai").assert;

describe("Merging Ghostmode options", function () {
    it("should merge ghost mode set to false", function () {
        var arg = false;
        var defaultVal = defaultConfig.ghostMode;
        var actual = callbacks.ghostMode(defaultVal, arg);
        assert.equal(actual, arg);
    });
    it("should merge ghost mode set to false as string", function () {
        var arg = "false";
        var defaultVal = defaultConfig.ghostMode;
        var actual = callbacks.ghostMode(defaultVal, arg);
        assert.equal(actual, false);
    });
    it("should merge ghost mode option when certain options disabled", function () {
        var arg = {
            links: true
        };
        var defaultVal = defaultConfig.ghostMode;
        var actual = callbacks.ghostMode(defaultVal, arg);
        assert.equal(actual, arg);
    });
});
