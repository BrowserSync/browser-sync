"use strict";

var index = require("../../lib/index");
var assert = require("chai").assert;
var _ = require("lodash");
var cliUtils = require("../../lib/cli").utils;
var defaultConfig = require("../../lib/default-config");

describe("Merging configs", function () {

    describe("Merging configs", function () {
        before(function () {
        });
        after(function () {
        });
        it("can merge two configs (1)", function () {
            var options = {
                server: {
                    baseDir: "./"
                }
            };
            var config = cliUtils.mergeConfigObjects(options);
            var actual = config.server.baseDir;
            var expected = "./";
            assert.equal(actual, expected);
        });
        it("can merge two configs (2)", function () {
            var options = {
                proxy: {
                    host: "local.dev"
                }
            };
            var config = cliUtils.mergeConfigObjects(options);
            var actual = config.proxy.host;
            var expected = "local.dev";
            assert.equal(actual, expected);
        });
    });

    describe("merging files & exlude options", function () {
        before(function () {
        });
        after(function () {
        });

        it("can merge an exclude folder (1)", function () {
            var files = "**/*.css";
            var exclude = "public/css/dist";
            var actual = cliUtils.mergeFiles(files, exclude);
            var expected = ["**/*.css", "!public/css/dist/**"];
            assert.deepEqual(actual, expected);
        });
        it("can merge an exclude folder (2)", function () {
            var files = "**/*.css";
            var exclude = "css/dist";
            var actual = cliUtils.mergeFiles(files, exclude);
            var expected = ["**/*.css", "!css/dist/**"];
            assert.deepEqual(actual, expected);
        });
        it("can merge an exclude folder with array of files", function () {
            var files = ["**/*.css", "*.html"];
            var exclude = "css/dist";
            var actual = cliUtils.mergeFiles(files, exclude);
            var expected = ["**/*.css", "*.html", "!css/dist/**"];
            assert.deepEqual(actual, expected);
        });
        it("can merge an array of exludes with an array of files", function () {
            var files = ["**/*.css", "*.html"];
            var exclude = ["css/dist", "app/views"];
            var actual = cliUtils.mergeFiles(files, exclude);
            var expected = ["**/*.css", "*.html", "!css/dist/**", "!app/views/**"];
            assert.deepEqual(actual, expected);
        });
        it("can merge an array of exludes with specific files", function () {
            var files = ["**/*.css", "*.html"];
            var exclude = ["css/dist/core.css", "app/views"];
            var actual = cliUtils.mergeFiles(files, exclude);
            var expected = ["**/*.css", "*.html", "!css/dist/core.css", "!app/views/**"];
            assert.deepEqual(actual, expected);
        });
    });

    describe("wrapping file patterns for exclusion", function () {
        it("should wrap a DIR (1)", function () {
            var actual = cliUtils._wrapPattern("css");
            var expected = "!css/**";
            assert.equal(actual, expected);
        });
        it("should wrap a DIR (2)", function () {
            var actual = cliUtils._wrapPattern("css/dist");
            var expected = "!css/dist/**";
            assert.equal(actual, expected);
        });
        it("should wrap a DIR with trailing slash", function () {
            var actual = cliUtils._wrapPattern("css/");
            var expected = "!css/**";
            assert.equal(actual, expected);
        });
        it("should wrap a DIR with trailing stars", function () {
            var actual = cliUtils._wrapPattern("css/**");
            var expected = "!css/**";
            assert.equal(actual, expected);
        });
        it("should not wrap any patterns pointing to specific files (1)", function () {
            var actual = cliUtils._wrapPattern("css/dist/style.css");
            var expected = "!css/dist/style.css";
            assert.equal(actual, expected);
        });
        it("should not wrap any patterns pointing to specific files (2)", function () {
            var actual = cliUtils._wrapPattern("css/dist/style.torrent");
            var expected = "!css/dist/style.torrent";
            assert.equal(actual, expected);
        });
    });

    describe("merging the excludedFileTypes array", function () {
        var config;
        var merged;
        var mergedLength;
        var len;
        beforeEach(function () {
            config = {
                excludedFileTypes: ["ozz", "mv3"]
            };
            len = defaultConfig.excludedFileTypes.length;
            merged = cliUtils._mergeExcluded(defaultConfig, config);
            mergedLength = merged.excludedFileTypes.length;
        });
        it("should merge the user-given excludedFileTypes with the default (length check)", function () {
            assert.equal(mergedLength, len + 2);
        });
        it("should merge the user-given excludedFileTypes with the (contains)", function () {
            var actual = _.contains(merged.excludedFileTypes, "ozz");
            assert.isTrue(actual);
        });
        it("should merge the user-given excludedFileTypes with the (contains)", function () {
            var actual = _.contains(merged.excludedFileTypes, "mv3");
            assert.isTrue(actual);
        });
        it("should merge not throw if empty array given", function () {
            var merged = cliUtils._mergeExcluded(defaultConfig, {excludedFileTypes: []});
            var actual = merged.excludedFileTypes;
            assert.equal(actual.length, len);
        });
    });
});