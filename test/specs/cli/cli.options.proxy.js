"use strict";

var cli             = require("../../../lib/cli/");
var options         = cli.options;
var merge           = cli.options.merge;
var assert = require("chai").assert;

describe("CLI: Options: Merging Proxy Options", function () {

    var defaultValue;

    beforeEach(function () {
        defaultValue = false;
    });

    it("should merge a url with HTTP", function () {
        var imm = merge({
            proxy: "http://localhost:8000"
        });
        assert.deepEqual(imm.get("proxy").toJS(), {
            protocol: "http",
            host: "localhost",
            port: 8000,
            target: "http://localhost:8000"
        });
    });
    it("should merge a url with HTTPS", function () {
        var imm = merge({
            proxy: "https://localhost:8010"
        });
        assert.deepEqual(imm.get("proxy").toJS(), {
            protocol: "https",
            host: "localhost",
            port: 8010,
            target: "https://localhost:8010"
        });
    });
    it("should merge a url with no protocol", function () {
        var imm = merge({
            proxy: "localhost:8010"
        });
        assert.deepEqual(imm.get("proxy").toJS(), {
            protocol: "http",
            host: "localhost",
            port: 8010,
            target: "http://localhost:8010"
        });
    });
    it("should merge IP hostname", function () {
        var imm = merge({
            proxy: "192.168.0.4"
        });
        assert.deepEqual(imm.get("proxy").toJS(), {
            protocol: "http",
            host: "192.168.0.4",
            port: 80,
            target: "http://192.168.0.4"
        });
    });
    it("should merge IP hostname with port", function () {
        var imm = merge({
            proxy: "192.168.0.4:9001"
        });
        assert.deepEqual(imm.get("proxy").toJS(), {
            protocol: "http",
            host: "192.168.0.4",
            port: 9001,
            target: "http://192.168.0.4:9001"
        });
    });
    it("should merge a url with no protocol & no port", function () {
        var imm = merge({
            proxy: "localhost"
        });
        assert.deepEqual(imm.get("proxy").toJS(), {
            protocol: "http",
            host: "localhost",
            port: 80,
            target: "http://localhost"
        });
    });
    it("should merge a url with no protocol & no port", function () {
        var imm = merge({
            proxy: "local.dev"
        });
        assert.deepEqual(imm.get("proxy").toJS(), {
            protocol: "http",
            host: "local.dev",
            port: 80,
            target: "http://local.dev"
        });
    });
    describe("Setting the start path", function () {
        it("should merge a url with path", function () {
            var imm = merge({
                proxy: "http://local.dev/subdir"
            });
            assert.deepEqual(imm.get("proxy").toJS(), {
                protocol: "http",
                host: "local.dev",
                port: 80,
                startPath: "subdir",
                target: "http://local.dev"
            });
        });
        it("should merge a url with path & query params", function () {
            var imm = merge({
                proxy: "http://local.dev/subdir/another/path?rel=123"
            });
            assert.deepEqual(imm.get("proxy").toJS(), {
                protocol: "http",
                host: "local.dev",
                port: 80,
                startPath: "subdir/another/path?rel=123",
                target: "http://local.dev"
            });
        });
    });
});
