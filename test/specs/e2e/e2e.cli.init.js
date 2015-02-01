"use strict";

var assert  = require("chai").assert;
var fs      = require("fs");
var path    = require("path");
var exec    = require("child_process").exec;

var pkg     = require(path.resolve("package.json"));

describe("E2E CLI init test", function () {

    var bs;
    var chunks = [];

    before(function (done) {
        bs = exec("node " + path.resolve(pkg.bin) + "  init", function () {
            bs.kill("SIGTERM");
            done();
        });
        bs.stdout.on("data", function (data) {
            chunks.push(data);
        });
    });

    after(function (done) {
        fs.unlink("bs-config.js", done);
    });

    it("creates a config file in cwd", function () {
        assert.include(chunks.join(""), "Config file created bs-config.js");
    });
});
