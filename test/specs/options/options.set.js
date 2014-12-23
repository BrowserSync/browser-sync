"use strict";

var browserSync = require("../../../index");

var assert  = require("chai").assert;

describe("Setting options during runtime", function () {

    var instance;

    before(function (done) {
        browserSync.reset();
        instance = browserSync({logLevel: "silent"}, done).instance;
    });

    after(function () {
        instance.cleanup();
    });

    it("should update options with event", function (done) {

        instance.events.on("options:set", function () {

            assert.deepEqual(instance.options.ghostMode.clicks, false);
            done();
        });

        instance.setOption("ghostMode.clicks", false);
    });
});
