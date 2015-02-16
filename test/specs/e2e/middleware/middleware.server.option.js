"use strict";

var browserSync = require("../../../../index");

var assert  = require("chai").assert;

describe("Accepting middleware as a server option", function () {

    var bs;

    before(function (done) {

        browserSync.reset();

        var fn = function (req) {
            console.log(req.url);
        };

        var config = {
            server: {
                baseDir: "./app",
                middleware: fn // Back compat
            },
            logLevel: "silent",
            open: false
        };

        bs = browserSync.init(config, done).instance;
    });

    after(function () {
        bs.cleanup();
    });

    it("serves files from the middleware with snippet added", function () {
        assert.equal(bs.options.get("middleware").size, 1);
    });
});
