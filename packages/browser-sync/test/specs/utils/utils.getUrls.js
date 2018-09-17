var utils = require("../../../dist/utils");
var merge = require("../../../dist/cli/cli-options").merge;
var assert = require("chai").assert;

var external = "192.168.0.4";

describe("Utils: creating URLs", function() {
    var options;
    beforeEach(function() {
        [options] = merge({
            port: 3002
        });
    });
    it("should return an object with local + remote", function() {
        var actual = utils.getUrls(external, "localhost", "http", options);
        var expected = {
            local: "http://localhost:3002",
            external: "http://192.168.0.4:3002"
        };
        assert.deepEqual(actual, expected);
    });
    it("should return an object with local + external (2)", function() {
        var actual = utils.getUrls("10.33.233.3", "localhost", "http", options);
        var expected = {
            local: "http://localhost:3002",
            external: "http://10.33.233.3:3002"
        };
        assert.deepEqual(actual, expected);
    });
    it("should return an object with local + external with paths", function() {
        [options] = merge({ startPath: "app", port: 3002 });
        var actual = utils.getUrls("10.33.233.3", "localhost", "http", options);
        var expected = {
            local: "http://localhost:3002/app",
            external: "http://10.33.233.3:3002/app"
        };
        assert.deepEqual(actual, expected);
    });
    it("should return an object with local + external with paths & Params", function() {
        [options] = merge({ startPath: "app/home?rel=123", port: 3002 });
        var actual = utils.getUrls("10.33.233.3", "localhost", "http", options);
        var expected = {
            local: "http://localhost:3002/app/home?rel=123",
            external: "http://10.33.233.3:3002/app/home?rel=123"
        };
        assert.deepEqual(actual, expected);
    });
});
