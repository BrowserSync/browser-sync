"use strict";

var path        = require("path");
var assert      = require("chai").assert;
var browserSync = require(path.resolve("./"));

var pkg         = require(path.resolve("package.json"));
var cli         = require(path.resolve(pkg.bin));

describe("E2E CLI - fail on invalid flags", function () {

    it("Log errors about unknown flags", function (done) {

        browserSync.reset();

        cli({
            cli: {
                input: ["start"],
                flags: {
                    logLevel: "silent",
                    server: true,
                    proxy: "http://bbc.co.uk",
                    shaneHasKatz: true
                }
            },
            cb: function (err) {
                assert.isTrue(err instanceof Error);
                done();
            }
        });
    });
});
