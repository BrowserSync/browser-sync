var defaultConfig = require("../../../lib/default-config");
var cli = require("../../../lib/cli");
var options = cli.options;
var _ = require("lodash");

var assert = require("chai").assert;

describe("wrapping file patterns for exclusion", function () {
    it("should wrap a DIR (1)", function () {
        var files = "css/*.css";
        var excluded = "css/dist/*";
        var actual = options._mergeFilesOption(files, excluded);
        var expected = ["css/*.css", "!css/dist/*"];
        assert.deepEqual(actual, expected);
    });
//    it("should wrap a DIR (2)", function () {
//        var actual = options._mergeExcludedOption("css/dist");
//        var expected = "!css/dist/**";
//        assert.equal(actual, expected);
//    });
//    it("should wrap a DIR with trailing slash", function () {
//        var actual = options._mergeExcludedOption("css/");
//        var expected = "!css/**";
//        assert.equal(actual, expected);
//    });
//    it("should wrap a DIR with trailing stars", function () {
//        var actual = options._mergeExcludedOption("css/**");
//        var expected = "!css/**";
//        assert.equal(actual, expected);
//    });
//    it("should not wrap any patterns pointing to specific files (1)", function () {
//        var actual = options._mergeExcludedOption("css/dist/style.css");
//        var expected = "!css/dist/style.css";
//        assert.equal(actual, expected);
//    });
//    it("should not wrap any patterns pointing to specific files (2)", function () {
//        var actual = options._mergeExcludedOption("css/dist/style.torrent");
//        var expected = "!css/dist/style.torrent";
//        assert.equal(actual, expected);
//    });
});