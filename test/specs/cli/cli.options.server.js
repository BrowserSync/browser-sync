"use strict";

var defaultConfig   = require("../../../lib/default-config");
var cli             = require("../../../lib/cli/");
var options         = cli.options;

var assert = require("chai").assert;

describe("CLI: Options: Merging Server Options", function () {
    var defaultValue;
    beforeEach(function () {
        defaultValue = false;
    });
    it("should merge default + command line options", function () {
        var arg = true;
        var actual = options.callbacks.server(defaultValue, arg);
        var expected = {
            baseDir: "./"
        };
        assert.deepEqual(actual, expected);
    });
    it("should set the base dir if given", function () {
        var arg = "app";
        var actual = options.callbacks.server(defaultValue, arg);
        var expected = {
            baseDir: "app"
        };
        assert.deepEqual(actual, expected);
    });
    it("should set the base dir if given", function () {
        var arg = "app/dist";
        var argv = {
            index: "index.htm"
        };
        var actual = options.callbacks.server(defaultValue, arg, argv);
        var expected = {
            baseDir: "app/dist",
            index: "index.htm"
        };
        assert.deepEqual(actual, expected);
    });
    it("should set the base dir if given", function () {
        var arg = true;
        var argv = {
            index: "index.htm"
        };
        var actual = options.callbacks.server(defaultValue, arg, argv);
        var expected = {
            baseDir: "./",
            index: "index.htm"
        };
        assert.deepEqual(actual, expected);
    });
    it("should set the base dir if given in object", function () {
        var arg = {
            baseDir: "./app"
        };
        var actual = options.callbacks.server(defaultValue, arg, {});
        var expected = {
            baseDir: "./app"
        };
        assert.deepEqual(actual, expected);
    });
    it("should set the base dir & index if given in object", function () {
        var arg = {
            baseDir: "./app",
            index: "mypage.html"
        };
        var actual = options.callbacks.server(defaultValue, arg, {});
        assert.deepEqual(actual, arg);
    });
    it("should set the directory if given on the command line", function () {
        var arg = "app";
        var argv = {
            directory: true
        };
        var expected = {
            baseDir: "app",
            directory: true
        };
        var actual   = options.callbacks.server(defaultValue, arg, argv);
        assert.deepEqual(actual, expected);
    });
});
