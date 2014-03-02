var utils = require("../../../lib/utils").utils;
var assert = require("chai").assert;

describe("creating URL from options", function () {

    var url = "http://0.0.0.0:3002";

    it("should return the url if no start path given", function () {
        var options = {
            startPath: false
        };
        var actual = utils.getUrl(url, options);
        assert.equal(actual, url);
    });
    it("should return the url with a path appended", function () {
        var options = {
            startPath: "app/mysite"
        };
        var actual = utils.getUrl(url, options);
        var expected = "http://0.0.0.0:3002/app/mysite";
        assert.equal(actual, expected);
    });
    it("should return the url with a path appended with leading slash", function () {
        var options = {
            startPath: "/app/mysite"
        };
        var actual = utils.getUrl(url, options);
        var expected = "http://0.0.0.0:3002/app/mysite";
        assert.equal(actual, expected);
    });
});