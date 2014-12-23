"use strict";

var index       = require("../../../");
var BrowserSync = require("../../../lib/browser-sync");

var assert      = require("chai").assert;

describe("Main Export", function () {

    var bs;

    before(function (done) {
        index.reset();
        bs = index({logLevel: "silent"}, done);
    });

    after(function () {
        bs.cleanup();
    });

    it("should be an instance of BrowserSync", function () {
        assert.isTrue(bs.instance instanceof BrowserSync);
    });
});
