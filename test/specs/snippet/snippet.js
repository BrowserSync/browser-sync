"use strict";

var utils   = require("../../../lib/snippet").utils;

var assert  = require("chai").assert;

describe("Snippet: returning the snippet regex", function () {
    it("should return a working regex", function () {
        var actual = utils.getRegex();
        assert.isTrue(actual.match instanceof RegExp);
        assert.isFunction(actual.fn);
    });
    it("should append a snippet", function () {
        var string   = "<body></body>";
        var snippet  = "SNIPPET";
        var expected = "<body>SNIPPET</body>";
        var regex    = utils.getRegex(snippet);

        var actual   = string.replace(regex.match, regex.fn);
        assert.equal(actual, expected);
    });
    it("should append a snippet", function () {
        var string   = "<body><h1>Here's an iframe</h1><body></body></body>";
        var snippet  = "SNIPPET";
        var expected = "<body>SNIPPET<h1>Here's an iframe</h1><body></body></body>";
        var regex    = utils.getRegex(snippet);

        var actual   = string.replace(regex.match, regex.fn);
        assert.equal(actual, expected);
    });
    it("should append a snippet", function () {
        var string   = "<body><script> var shane = '<body>'; </script><body></body></body>";
        var snippet  = "SNIPPET";
        var expected = "<body>SNIPPET<script> var shane = '<body>'; </script><body></body></body>";
        var regex    = utils.getRegex(snippet);

        var actual   = string.replace(regex.match, regex.fn);
        assert.equal(actual, expected);
    });
});
