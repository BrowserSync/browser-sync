"use strict";

var browserSync = require("../../../");

var assert      = require("chai").assert;

describe("API: .init - don't not call init when already running.", function () {

    var instance;

    before(function (done) {
        browserSync.reset();
        var config = {
            logLevel: "silent",
            open: false
        };

        instance = browserSync(config, function () {
            done();
        });
    });

    after(function () {
        instance.cleanup();
    });

    it("should know the active State of BrowserSync", function () {
        var spy = require("sinon").spy(console, "log");
        browserSync({server: "test/fixtures"});
        var arg = spy.getCall(0).args[0];
        assert.include(arg, "browserSync.create().init()");
        console.log.restore();
    });
});
