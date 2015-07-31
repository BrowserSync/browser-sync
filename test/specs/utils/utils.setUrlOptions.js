"use strict";

var utils    = require("../../../lib/utils");
var merge    = require("../../../lib/cli/cli-options").merge;

var assert    = require("chai").assert;
var sinon     = require("sinon");

var external = "192.168.0.4";

describe("Utils: creating URLs", function () {
    var opts, ipStub;
    before(function () {
        ipStub = sinon.stub(utils, "getHostIp").returns(external);
    });
    after(function () {
        ipStub.restore();
    });
    afterEach(function () {
        ipStub.reset();
    });
    beforeEach(function () {
        opts = merge({
            port: 3000,
            server: true,
            scheme: "http"
        });
    });
    it("should return the local when offline", function () {
        var opts = merge({
            port: 3000,
            server: true,
            scheme: "http",
            online: false
        });
        assert.deepEqual(utils.getUrlOptions(opts).toJS(), {
            local: "http://localhost:3000"
        });
    });
    it("should return the external", function () {
        var opts = merge({
            port: 3000,
            server: true,
            scheme: "http",
            online: true
        });
        assert.deepEqual(utils.getUrlOptions(opts).toJS(), {
            local: "http://localhost:3000",
            external: "http://" + external + ":3000"
        });
    });
    it("should return the external/local with xip", function () {
        var opts = merge({
            port: 3000,
            server: true,
            scheme: "https",
            online: true,
            xip: true
        });
        var out = utils.getUrlOptions(opts);
        assert.equal(out.get("local"), "https://127.0.0.1.xip.io:3000");
        assert.equal(out.get("external"), "https://" + external + ".xip.io:3000");
    });
    it("should return the URLs when OFFLINE & XIP set", function () {
        var opts = merge({
            port: 3000,
            server: true,
            scheme: "http",
            online: false,
            xip: true
        });
        assert.deepEqual(utils.getUrlOptions(opts).toJS(), {
            local: "http://localhost:3000"
        });
    });
    it("should return the external/local namespace", function () {
        var opts = merge({
            port: 3000,
            server: true,
            scheme: "http",
            online: true,
            localNamespace: "local.dev"
        });
        assert.deepEqual(utils.getUrlOptions(opts).toJS(), {
            local: "http://local.dev:3000",
            external: "http://" + external + ":3000"
        });
    });
    it("should return the URLs when local namespace, OFFLINE, & XIP set", function () {
        var opts = merge({
            port: 3000,
            server: true,
            scheme: "http",
            online: false,
            xip: true,
            localNamespace: "local.dev"
        });
        assert.deepEqual(utils.getUrlOptions(opts).toJS(), {
            local: "http://local.dev:3000"
        });
    });
    it("should return the external/local namespace with XIP", function () {
        var opts = merge({
            port: 3000,
            server: true,
            scheme: "https",
            online: true,
            xip: true,
            localNamespace: "local.dev"
        });
        var out = utils.getUrlOptions(opts);
        assert.equal(out.get("local"), "https://127.0.0.1.xip.io:3000");
        assert.equal(out.get("external"), "https://" + external + ".xip.io:3000");
    });
});
