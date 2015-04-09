"use strict";

var cli             = require("../../../lib/cli/cli-options");
var merge           = cli.merge;
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
        var out = imm.get("proxy").toJS();
        assert.equal(out.target, "http://localhost:8000");
    });
    it("should merge a url with HTTPS", function () {
        var imm = merge({
            proxy: "https://localhost:8010"
        });
        var out = imm.get("proxy").toJS();
        assert.equal(out.target, "https://localhost:8010");
    });
    it("should merge a url with no protocol", function () {
        var imm = merge({
            proxy: "localhost:8010"
        });
        var out = imm.get("proxy").toJS();
        assert.equal(out.target, "http://localhost:8010");
    });
    it("should merge IP hostname", function () {
        var imm = merge({
            proxy: "192.168.0.4"
        });
        var out = imm.get("proxy").toJS();
        assert.equal(out.target, "http://192.168.0.4");
    });
    it("should merge IP hostname with port", function () {
        var imm = merge({
            proxy: "192.168.0.4:9001"
        });
        assert.equal(imm.getIn(["proxy", "target"]), "http://192.168.0.4:9001");
        assert.equal(imm.getIn(["proxy", "url", "port"]), 9001);
    });
    it("should merge a url with no protocol & no port", function () {
        var imm = merge({
            proxy: "localhost"
        });
        assert.equal(imm.getIn(["proxy", "url", "port"]), 80);
    });
    it("should merge a url with no protocol & no port", function () {
        var imm = merge({
            proxy: "local.dev"
        });
        assert.equal(imm.getIn(["proxy", "target"]), "http://local.dev");
    });
    describe("Setting the start path", function () {
        it("should merge a url with path", function () {
            var imm = merge({
                proxy: "http://local.dev/subdir"
            });
            assert.equal(imm.getIn(["proxy", "target"]), "http://local.dev");
        });
        it("should merge a url with path & query params", function () {
            var imm = merge({
                proxy: "http://local.dev/subdir/another/path?rel=123"
            });
            assert.equal(imm.getIn(["proxy", "target"]), "http://local.dev");
            assert.equal(imm.getIn(["proxy", "url", "port"]), 80);
        });
    });
});
