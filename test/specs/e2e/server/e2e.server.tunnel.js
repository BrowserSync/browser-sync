"use strict";

var browserSync = require("../../../../index");

var assert = require("chai").assert;
var sinon  = require("sinon");
var ngrok  = require("ngrok");

describe("Tunnel e2e tests", function () {

    var bs;

    before(function (done) {

        browserSync.reset();

        var config = {
            server:    {
                baseDir: "test/fixtures"
            },
            logLevel: "silent",
            open:      false,
            tunnel:    true,
            online:    true
        };
        bs = browserSync(config, done).instance;
    });

    after(function () {
        bs.cleanup();
        bs.tunnel.disconnect();
    });

    it("should call init on the tunnel", function () {
        assert.include(bs.options.getIn(["urls", "tunnel"]), "ngrok");
    });
});

describe("Tunnel e2e tests passing config", function () {

    var bs, stub;

    before(function (done) {

        browserSync.reset();

        stub = sinon
            .stub(ngrok, "connect")
            .yields(null, "http://shane.com");

        var config = {
            server:    {
                baseDir: "test/fixtures"
            },
            logLevel: "silent",
            open:      false,
            online:    true,
            tunnel:    {
                authtoken: "shakyshane",
                somevar:   9000
            }
        };
        bs = browserSync(config, done).instance;
    });

    after(function () {
        bs.cleanup();
        ngrok.connect.restore();
    });

    it("should call init on the tunnel", function () {
        assert.equal(bs.options.getIn(["tunnel", "authtoken"]), "shakyshane");
        assert.equal(bs.options.getIn(["tunnel", "somevar"]), 9000);
        assert.equal(bs.options.getIn(["urls",   "tunnel"]), "http://shane.com");
    });
});

describe("Tunnel e2e tests - handling errors", function () {

    var bs, stub;

    before(function (done) {

        browserSync.reset();

        stub = sinon
            .stub(ngrok, "connect")
            .yields(new Error("Cannot connect"));

        var config = {
            server:    {
                baseDir: "test/fixtures"
            },
            logLevel: "silent",
            open:      false,
            online:    true,
            tunnel:    {
                authtoken: "shakyshane",
                somevar:   9000
            }
        };

        bs = browserSync(config, done).instance;
    });

    after(function () {
        bs.cleanup();
        ngrok.connect.restore();
    });

    it("should call init on the tunnel", function () {
        assert.isUndefined(bs.getOptionIn(["urls", "tunnel"]));
        assert.isUndefined(bs.tunnel);
    });
});
