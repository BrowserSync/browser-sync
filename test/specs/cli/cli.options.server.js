"use strict";

var cli             = require("../../../lib/cli/");
var options         = cli.options;

var assert = require("chai").assert;

describe("CLI: Options: Merging Server Options", function () {
    var defaultValue;
    beforeEach(function () {
        defaultValue = false;
    });
    it("should merge default + command line options", function () {
        var value  = true;
        var actual = options.callbacks.server(defaultValue, value, value, undefined);
        var expected = {
            baseDir: "./"
        };
        assert.deepEqual(actual, expected);
    });
    it("should set the base dir if given", function () {
        var value = "app";
        var actual = options.callbacks.server(defaultValue, value, value, undefined);
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
        var actual = options.callbacks.server(defaultValue, arg, arg, argv);
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
        var actual = options.callbacks.server(defaultValue, arg, arg, argv);
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
        var actual = options.callbacks.server(defaultValue, arg, arg, undefined);
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
        var actual = options.callbacks.server(defaultValue, arg, arg, undefined);
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
        var actual   = options.callbacks.server(defaultValue, arg, arg, argv);
        assert.deepEqual(actual, expected);
    });
});
