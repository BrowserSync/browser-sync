var proxy = require("../../../lib/proxy");
var utils = proxy.utils;
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
});
