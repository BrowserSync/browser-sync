"use strict";

var defaultConfig   = require("../../../lib/default-config");
var cli             = require("../../../lib/cli/");
var options         = cli.options;
var callbacks       = options.callbacks;

var assert = require("chai").assert;

describe("CLI: Options: Merging Ghostmode options", function () {
    it("should merge ghost mode set to false from cli", function () {
        var arg = false;
        var defaultVal = defaultConfig.ghostMode;
        var actual = callbacks.ghostMode(defaultVal, arg, arg, {ghost: false});
        assert.equal(actual.forms.submit, false);
        assert.equal(actual.forms.inputs, false);
        assert.equal(actual.forms.toggles, false);
    });
    it("should merge ghost mode set to false", function () {
        var arg = false;
        var defaultVal = defaultConfig.ghostMode;
        var actual = callbacks.ghostMode(defaultVal, arg, arg);
        assert.equal(actual.forms.submit, false);
        assert.equal(actual.forms.inputs, false);
        assert.equal(actual.forms.toggles, false);
    });
    it("should merge ghost mode set to false as string", function () {
        var arg = "false";
        var defaultVal = defaultConfig.ghostMode;
        var actual = callbacks.ghostMode(defaultVal, arg, arg);
        assert.equal(actual.forms.submit, false);
        assert.equal(actual.forms.inputs, false);
        assert.equal(actual.forms.toggles, false);
    });
});
