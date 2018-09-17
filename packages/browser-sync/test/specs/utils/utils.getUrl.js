var utils = require("../../../dist/utils");
var merge = require("../../../dist/cli/cli-options").merge;
var assert = require("chai").assert;

describe("Utils: creating URL from options", function() {
    var url = "http://0.0.0.0:3002";

    it("should return the url if no start path given", function() {
        var [options] = merge({ startPath: false });
        var actual = utils.getUrl(url, options);
        assert.equal(actual, url);
    });
    it("should return the url with a path appended", function() {
        var [options] = merge({ startPath: "app/mysite" });
        var actual = utils.getUrl(url, options);
        var expected = "http://0.0.0.0:3002/app/mysite";
        assert.equal(actual, expected);
    });
    it("should return the url with a path appended with leading slash", function() {
        var [options] = merge({ startPath: "/app/mysite" });
        var actual = utils.getUrl(url, options);
        var expected = "http://0.0.0.0:3002/app/mysite";
        assert.equal(actual, expected);
    });

    describe("When the start path is set in the proxy", function() {
        it("should return the url with a path appended from proxy", function() {
            var [options] = merge({
                proxy: url,
                startPath: "subdir/another/path"
            });
            var actual = utils.getUrl(url, options);
            var expected = "http://0.0.0.0:3002/subdir/another/path";
            assert.equal(actual, expected);
        });
        it("should return the url with a path appended from proxy", function() {
            var [options] = merge({
                proxy: url,
                startPath: "subdir"
            });
            var actual = utils.getUrl(url, options);
            var expected = "http://0.0.0.0:3002/subdir";
            assert.equal(actual, expected);
        });
        it("should return the url with a path appended from proxy with query", function() {
            var [options] = merge({
                proxy: url,
                startPath: "subdir?rel=1234"
            });
            var actual = utils.getUrl(url, options);
            var expected = "http://0.0.0.0:3002/subdir?rel=1234";
            assert.equal(actual, expected);
        });
    });
});
