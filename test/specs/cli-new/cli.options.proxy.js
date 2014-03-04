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

    it("should merge default + command line options", function () {
        var arg = "http://localhost:8000";
        var actual = options._mergeProxyOption(defaultValue, arg);
        var expected = {
            host: "localhost",
            port: "8000"
        };
        assert.deepEqual(actual, expected);
    });
});
