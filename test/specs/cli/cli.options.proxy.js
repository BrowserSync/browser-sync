"use strict";

var defaultConfig   = require("../../../lib/default-config");
var cli             = require("../../../lib/cli");
var options         = cli.options;

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
            protocol: "http",
            host: "localhost",
            port: 8000
        };
        assert.deepEqual(actual, expected);
    });
    it("should merge a url with HTTPS", function () {
        var arg = "https://localhost:8010";
        var actual = options._mergeProxyOption(defaultValue, arg);
        var expected = {
            protocol: "https",
            host: "localhost",
            port: 8010
        };
        assert.deepEqual(actual, expected);
    });
    it("should merge a url with no protocol", function () {
        var arg = "localhost:8010";
        var actual = options._mergeProxyOption(defaultValue, arg);
        var expected = {
            protocol: "http",
            host: "localhost",
            port: 8010
        };
        assert.deepEqual(actual, expected);
    });
    it("should merge IP hostname", function () {
        var arg = "192.168.0.4";
        var actual = options._mergeProxyOption(defaultValue, arg);
        var expected = {
            protocol: "http",
            host: "192.168.0.4",
            port: 80
        };
        assert.deepEqual(actual, expected);
    });
    it("should merge IP hostname with port", function () {
        var arg = "192.168.0.4:9001";
        var actual = options._mergeProxyOption(defaultValue, arg);
        var expected = {
            protocol: "http",
            host: "192.168.0.4",
            port: 9001
        };
        assert.deepEqual(actual, expected);
    });
    it("should merge a url with no protocol & no port", function () {
        var arg = "localhost";
        var actual = options._mergeProxyOption(defaultValue, arg);
        var expected = {
            protocol: "http",
            host: "localhost",
            port: 80
        };
        assert.deepEqual(actual, expected);
    });
    it("should merge a url with no protocol & no port", function () {
        var arg = "local.dev";
        var actual = options._mergeProxyOption(defaultValue, arg);
        var expected = {
            protocol: "http",
            host: "local.dev",
            port: 80
        };
        assert.deepEqual(actual, expected);
    });
    it("should merge a url with path", function () {
        var arg = "http://local.dev/subdir";
        var actual = options._mergeProxyOption(defaultValue, arg);
        var expected = {
            protocol: "http",
            host: "local.dev",
            port: 80
        };
        assert.deepEqual(actual, expected);
    });
    it("should merge a url with path (2)", function () {
        var arg = "http://local.dev/subdir/another/path";
        var actual = options._mergeProxyOption(defaultValue, arg);
        var expected = {
            protocol: "http",
            host: "local.dev",
            port: 80
        };
        assert.deepEqual(actual, expected);
    });
});
