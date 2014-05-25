"use strict";

var defaultConfig   = require("../../../lib/default-config");
var options         = require("../../../lib/cli-options");
var wrap            = options.utils.wrapPattern;

var assert          = require("chai").assert;

describe("wrapping file patterns for exclusion", function () {
    it("should wrap a DIR (2)", function () {
        var actual = wrap("css/dist");
        var expected = "!css/dist/**";
        assert.equal(actual, expected);
    });
    it("should wrap a DIR with trailing slash", function () {
        var actual = wrap("css/");
        var expected = "!css/**";
        assert.equal(actual, expected);
    });
    it("should wrap a DIR with trailing stars", function () {
        var actual = wrap("css/**");
        var expected = "!css/**";
        assert.equal(actual, expected);
    });
    it("should not wrap any patterns pointing to specific files (1)", function () {
        var actual = wrap("css/dist/style.css");
        var expected = "!css/dist/style.css";
        assert.equal(actual, expected);
    });
    it("should not wrap any patterns pointing to specific files (2)", function () {
        var actual = wrap("css/dist/style.torrent");
        var expected = "!css/dist/style.torrent";
        assert.equal(actual, expected);
    });
});