"use strict";

var browserSync = require("../../../index");

var assert = require("chai").assert;

describe("Tunnel e2e tests", function () {

    describe("E2E server test with tunnel", function () {

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
});
