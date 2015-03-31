"use strict";

var browserSync = require("../../../");

describe("E2E options test - ready callback as option", function () {

    it("Sets the available port", function (done) {
        browserSync.reset();
        browserSync({
            server:   {
                baseDir: "test/fixtures"
            },
            open:     false,
            logLevel: "silent",
            callbacks: {
                ready: function (err, bs) {
                    bs.cleanup();
                    done();
                }
            }
        });
    });
});
