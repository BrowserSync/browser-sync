"use strict";

var defaultConfig   = require("../../../lib/default-config");
var cli             = require("../../../lib/cli/");
var options         = cli.options;

var assert = require("chai").assert;

describe("CLI: Options: Merging Hostname option", function () {
    var defaultValue = null;
    it("should merge a hostname", function () {
        var arg = "localhost";
        var actual = options.callbacks.host(defaultValue, arg);
        assert.deepEqual(actual, arg);
    });
    it("should merge a hostname", function () {
        var arg = "127.0.0.1";
        var actual = options.callbacks.host(defaultValue, arg);
        assert.deepEqual(actual, arg);
    });
    it("should not merge an empty string", function () {
        var arg = "";
        var actual = options.callbacks.host(defaultValue, arg);
        var expected = null;
        assert.deepEqual(actual, expected);
    });
});
