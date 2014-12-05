"use strict";

var browserSync = require("../../../");

var assert      = require("chai").assert;

describe("API: .pause() / .resume() file reloading - ", function () {

    it("should be unpaused", function () {
        assert.isFalse(browserSync.paused);
    });

    it("should pause file reload:", function () {
        browserSync.pause();
        assert.isTrue(browserSync.paused);
    });

    it("should unpause file reload:", function () {
        browserSync.resume();
        assert.isFalse(browserSync.paused);
    });

});
