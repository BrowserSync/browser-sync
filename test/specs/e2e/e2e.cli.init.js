"use strict";

var assert  = require("chai").assert;
var exec    = require("child_process").execFile;

describe("E2E CLI init test", function () {

    var bs;
    var chunks = [];

    before(function (done) {
        bs = exec(__dirname + "/../../../bin/browser-sync.js", ["init"], function () {
            bs.kill("SIGTERM");
            done();
        });
        bs.stdout.on("data", function (data) {
            chunks.push(data);
        });
    });

    it("creates a config file in cwd", function () {
        assert.include(chunks.join(""), "Config file created bs-config.js");
    });
});
