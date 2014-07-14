"use strict";

var index       = require("../../../index");
var BrowserSync = require("../../../lib/browser-sync");

var assert      = require("chai").assert;

describe("Init method", function () {

    var instance;

    before(function (done) {
        instance = index({debugInfo: false}, done);
    });

    after(function () {
        instance.cleanup();
    });

    it("should accept files, config & callback", function () {
        assert.isTrue(instance instanceof BrowserSync);
    });
});