"use strict";

var browserSync = require("../../../index");
var utils       = require("../../../lib/utils");

var assert      = require("chai").assert;
var sinon       = require("sinon");
var stripColor  = require("chalk").stripColor;


describe("E2E `logPrefix` option", function () {

    var instance;
    var spy;

    before(function (done) {
        var config = {
            online: false,
            open: false,
            logPrefix: "BS2"
        };
        instance = browserSync(config, done);
        spy      = sinon.spy(console, "log");
    });

    after(function () {
        instance.cleanup();
        spy.restore();
    });

    it("Can set the log prefix when given in options", function () {
        var arg = spy.getCall(0).args[0];
        assert.include(stripColor(arg), "[BS2]");
        assert.notInclude(stripColor(arg), "[BS]");
    });
});