var defaultConfig = require("../../../lib/default-config");
var cli = require("../../../lib/cli");
var options = cli.options;
var _ = require("lodash");

var assert = require("chai").assert;

describe("Merging Server Options", function () {

    var defaultValue;

    beforeEach(function () {
        defaultValue = false;
    });

    it("should merge a url with HTTP", function () {
        var arg = "http://localhost:8000";
        var actual = options._mergeProxyOption(defaultValue, arg);
        var expected = {
            host: "localhost",
            port: "8000"
        };
        assert.deepEqual(actual, expected);
    });
    it("should merge a url with HTTPS", function () {
        var arg = "https://localhost:8010";
        var actual = options._mergeProxyOption(defaultValue, arg);
        var expected = {
            host: "localhost",
            port: "8010"
        };
        assert.deepEqual(actual, expected);
    });
});
