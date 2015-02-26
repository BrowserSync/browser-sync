"use strict";

var browserSync = require("../../../../index");

var assert = require("chai").assert;

describe("Tunnel e2e tests", function () {

    var instance;

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
        instance = browserSync(config, done).instance;
    });

    after(function () {
        instance.cleanup();
    });

    it("should call init on the tunnel", function () {
        assert.include(instance.options.getIn(["urls", "tunnel"]), "localtunnel.me");
    });
});

describe("Tunnel e2e tests with subdomain", function () {

    var instance;

    before(function (done) {
        browserSync.reset();
        var config = {
            server:    {
                baseDir: "test/fixtures"
            },
            logLevel: "silent",
            open:      false,
            tunnel:    Math.floor(Math.random() * 2e10),
            online:    true
        };
        instance = browserSync(config, done).instance;
    });

    after(function () {
        instance.cleanup();
    });

    it("should call init on the tunnel", function () {
        assert.include(instance.options.getIn(["urls", "tunnel"]), "localtunnel.me");
    });
});
