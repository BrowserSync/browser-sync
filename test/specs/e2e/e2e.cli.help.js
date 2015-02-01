"use strict";

var assert  = require("chai").assert;
var path    = require("path");
var exec    = require("child_process").exec;

var pkg     = require(path.resolve("package.json"));

describe("E2E CLI help test", function () {

    var bs;
    var chunks = [];

    before(function (done) {
        bs = exec("node " + path.resolve(pkg.bin), function () {
            bs.kill("SIGTERM");
            done();
        });
        bs.stdout.on("data", function (data) {
            chunks.push(data);
        });
    });

    it("returns the help text when no commands given", function (done) {
        assert.include(chunks.join(""), "Server Example:");
        done();
    });
});
