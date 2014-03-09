"use strict";

var proxy  = require("../../../lib/proxy");
var utils  = proxy.utils;

var assert = require("chai").assert;

var ports = [3000, 3001, 3002];
var proxyUrl = "192.168.0.4:3002";

describe("Rewriting Domains", function () {

    var ipServer, vhostServer, ipServerDefault;

    beforeEach(function () {
        ipServer = {
            host: "0.0.0.0",
            port: 8001
        };
        ipServerDefault = {
            host: "0.0.0.0",
            port: 80
        };
        vhostServer = {
            host: "local.dev"
        };
    });
    it("should return the correct regex for an IP based server with a port", function () {
        var actual = utils.rewriteLinks(ipServer, proxyUrl).match.toString();
        var expected = "/0.0.0.0:8001/g";
        assert.equal(actual, expected);
    });
    it("should return the correct regex for an IP based server with the default port", function () {
        var actual = utils.rewriteLinks(ipServerDefault, proxyUrl).match.toString();
        var expected = "/0.0.0.0/g";
        assert.equal(actual, expected);
    });
    it("should return the correct regex for a vhost based server", function () {
        var actual = utils.rewriteLinks(vhostServer, proxyUrl).match.toString();
        var expected = "/local.dev/g";
        assert.equal(actual, expected);
    });

    it("should return the correct regex for a vhost based server with a port", function () {
        vhostServer.port = "8000";
        var actual = utils.rewriteLinks(vhostServer, proxyUrl).match.toString();
        var expected = "/local.dev:8000/g";
        assert.equal(actual, expected);
    });
    it("should return the correct regex for a vhost based server with a DEFAULT port of 80", function () {
        vhostServer.port = "80";
        var actual = utils.rewriteLinks(vhostServer, proxyUrl).match.toString();
        var expected = "/local.dev/g";
        assert.equal(actual, expected);
    });
    it("should return the correct regex for a vhost based server with a DEFAULT port of 80", function () {
        vhostServer.port = 80;
        var actual = utils.rewriteLinks(vhostServer, proxyUrl).match.toString();
        var expected = "/local.dev/g";
        assert.equal(actual, expected);
    });

    it("should return a full url", function () {
        var opts = {
            protocol: "http",
            host: "localhost",
            port: 80
        };
        var actual   = utils.getProxyUrl(opts);
        var expected = "http://localhost";
        assert.equal(actual, expected);
    });
    it("should return a full url", function () {
        var opts = {
            protocol: "https",
            host: "local.dev",
            port: 8000
        };
        var actual   = utils.getProxyUrl(opts);
        var expected = "https://local.dev:8000";
        assert.equal(actual, expected);
    });

    describe("handling redirects", function () {
        var opts;
        beforeEach(function () {
            opts = {
                protocol: "http",
                host: "blossom.dev",
                port: 80
            };
        });
        it("should replace a 302 redirect link", function () {
            var host = "192.168.0.5";
            var port = 3002;
            var url = "http://blossom.dev/index.php/install/";
            var expected = "http://192.168.0.5:3002/index.php/install/";
            var actual   = utils.handleRedirect(url, opts, host, port);
            assert.equal(actual, expected);
        });
        it("should replace a 302 redirect link", function () {
            var host = "192.168.0.6";
            var port = 3003;
            var url = "http://blossom.dev/index.php/install/";
            var expected = "http://192.168.0.6:3003/index.php/install/";
            var actual   = utils.handleRedirect(url, opts, host, port);
            assert.equal(actual, expected);
        });
        it("should replace a 302 redirect link", function () {
            opts.port = 8000;
            var host = "192.168.0.6";
            var port = 3003;
            var url = "http://blossom.dev:8000/index.php/install/";
            var expected = "http://192.168.0.6:3003/index.php/install/";
            var actual   = utils.handleRedirect(url, opts, host, port);
            assert.equal(actual, expected);
        });
    });
});
