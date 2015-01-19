"use strict";

var browserSync = require("../../../index");
var assert      = require("chai").assert;
var sinon       = require("sinon");

describe("E2E `logSnippet` option", function () {

    var instance;
    var spy;

    before(function (done) {
        browserSync.reset();
        var config = {
            online: false,
            open: false,
            logSnippet: false
        };
        spy      = sinon.spy(console, "log");
        instance = browserSync(config, done).instance;
    });

    after(function () {
        instance.cleanup();
        console.log.restore();
    });

    it("Can set the log snippet when given in options", function () {
        var args = spy.getCall(0).args;
        args.forEach(function (arg) {
            assert.notInclude(String(arg), "browser-sync-client");
        });
    });
});
