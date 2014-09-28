"use strict";

var index       = require("../../../index");
var BrowserSync = require("../../../lib/browser-sync");

var assert      = require("chai").assert;

describe("Main Export", function () {

    var instance;

    before(function (done) {
        instance = index({debugInfo: false}, done);
    });

    after(function () {
        instance.cleanup();
    });

    it("should be an instance of BrowserSync", function () {
        assert.isTrue(instance instanceof BrowserSync);
    });
});
