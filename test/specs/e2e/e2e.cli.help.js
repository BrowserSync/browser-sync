"use strict";

var assert  = require("chai").assert;
var exec    = require("child_process").execFile;

describe("E2E CLI help test", function () {

    var bs;
    var chunks = [];

    before(function (done) {
        bs = exec(__dirname + "/../../../bin/browser-sync.js", function () {
            bs.emit("end");
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
