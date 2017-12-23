var utils = require("../../../dist/utils");
var merge = require("../../../dist/cli/cli-options").merge;

var assert = require("chai").assert;

describe("Utils: Adding xip", function() {
    it("can add xip.io when set in options", function() {
        var host = "192.15.122.9";
        var expected = "192.15.122.9.xip.io";
        var actual = utils.xip(host, merge({ xip: true }));
        assert.equal(actual, expected);
    });
    it("can add xip.io using hostnameSuffix", function() {
        var host = "192.15.122.9";
        var expected = "192.15.122.9.xip.io";
        var actual = utils.xip(host, merge({ hostnameSuffix: ".xip.io" }));
        assert.equal(actual, expected);
    });
    it("can add random.io using hostnameSuffix", function() {
        var host = "192.15.122.9";
        var expected = "192.15.122.9.random.io";
        var actual = utils.xip(host, merge({ hostnameSuffix: ".random.io" }));
        assert.equal(actual, expected);
    });
    it("does not add xip.io when using default option", function() {
        var host = "192.15.122.9";
        var expected = "192.15.122.9";
        var actual = utils.xip(host, merge());
        assert.equal(actual, expected);
    });
});
