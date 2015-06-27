"use strict";

var utils  = require("../../../lib/connect-utils");
var merge  = require("../../../lib/cli/cli-options").merge;
var assert = require("chai").assert;

// server,proxy: ['' + location.host + '/browser-sync']
// snippet:      ['http://' + location.hostname + ':3000/browser-sync']
// domain:       ['<domain>/browser-sync']

describe("Connection utils", function () {
    var options;
    beforeEach(function () {
        options = merge({
            port: 3002,
            scheme: "http",
            mode: "server"
        });
    });
    it("should return a connection url with http", function () {
        var actual   = utils.getConnectionUrl(options);
        var expected = "'' + location.host + '/browser-sync'";
        assert.equal(actual, expected);
    });
    it("should return a connection url for snippet mode", function () {
        var options = merge({
            port: 3002,
            scheme: "http",
            mode: "snippet"
        });
        var actual   = utils.getConnectionUrl(options);
        var expected = "'http://' + location.hostname + ':3002/browser-sync'";
        assert.equal(actual, expected);
    });
    it("should return a connection url for proxy mode", function () {
        var options = merge({
            port: 3002,
            scheme: "http",
            mode: "proxy"
        });
        var actual   = utils.socketConnector(options);
        assert.include(actual, "'' + location.host + '/browser-sync'");
    });
    it("should return a connection url for server mode", function () {
        var options = merge({
            port: 3002,
            scheme: "http",
            mode: "server"
        });
        var actual   = utils.socketConnector(options);
        assert.include(actual, "'' + location.host + '/browser-sync'");
    });
    it("should return a connection url for server mode, https", function () {
        var options = merge({
            port: 3002,
            scheme: "https",
            mode: "server"
        });
        var actual   = utils.socketConnector(options);
        assert.include(actual, "'' + location.host + '/browser-sync'");
    });
    it("should return a connection url for snippet mode", function () {
        var options = merge({
            port: 4002,
            scheme: "http",
            mode: "snippet"
        });
        var actual   = utils.socketConnector(options);
        assert.include(actual, "'http://' + location.hostname + ':4002/browser-sync'");
    });
    it("should return a connection url for secure snippet mode", function () {
        var options = merge({
            port: 4002,
            scheme: "https",
            mode: "snippet"
        });
        var actual   = utils.socketConnector(options);
        assert.include(actual, "'https://' + location.hostname + ':4002/browser-sync'");
    });
    it("should allow setting of the socket domain", function () {
        var options = merge({
            port: 3000,
            server: "test/fixtures",
            mode: "server",
            socket: {
                domain: "localhost:3000"
            }
        });
        var actual   = utils.socketConnector(options);
        assert.include(actual, "___browserSync___.io('localhost:3000/browser-sync', ___browserSync___.socketConfig);");
    });
    it("should allow setting of the socket domain + namespace", function () {
        var options = merge({
            port: 3000,
            server: "test/fixtures",
            mode: "server",
            socket: {
                namespace: "shane",
                domain: "localhost:3000"
            }
        });
        var actual   = utils.socketConnector(options);
        assert.include(actual, "___browserSync___.io('localhost:3000/shane', ___browserSync___.socketConfig);");
    });
    it("should allow setting of the socket domain (fn)+ namespace", function () {
        var options = merge({
            port: 3000,
            server: "test/fixtures",
            mode: "server",
            urls: {
                local: "http://localhost:3002"
            },
            socket: {
                namespace: "shane",
                domain: function (options) {
                    return options.getIn(["urls", "local"]);
                }
            }
        });
        var actual   = utils.socketConnector(options);
        assert.include(actual, "___browserSync___.io('http://localhost:3002/shane', ___browserSync___.socketConfig);");
    });
    it("should allow setting of the socket namespace with fn (back compat)", function () {
        var options = merge({
            port: 3000,
            server: "test/fixtures",
            mode: "server",
            urls: {
                local: "http://localhost:3002"
            },
            socket: {
                namespace: function () {
                    return "/browser-sync";
                }
            }
        });
        var actual   = utils.socketConnector(options);
        assert.include(actual, "___browserSync___.io('' + location.host + '/browser-sync', ___browserSync___.socketConfig);");
    });
});
