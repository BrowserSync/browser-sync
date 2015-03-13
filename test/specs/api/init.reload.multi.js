"use strict";

var browserSync = require("../../../");

var sinon       = require("sinon");
var assert      = require("chai").assert;

describe("API: .reload() with multi instances", function () {

    var clock, bs1, bs2;

    before(function (done) {
        browserSync.reset();

        bs1 = browserSync.create("Server 1").init({logLevel:"silent"}, function () {
            bs2 = browserSync.create("Server 2").init({logLevel: "silent"}, function () {
                done();
            }).instance;
        }).instance;

        clock = sinon.useFakeTimers();
    });

    afterEach(function () {
        clock.now = 0;
    });

    after(function () {
        clock.restore();
    });

    it("should be callable with no args & perform a reload", function () {
        assert.doesNotThrow(function () {
            browserSync.get("Server 1").reload();
            browserSync.get("Server 2").reload();
        });
    });
});
