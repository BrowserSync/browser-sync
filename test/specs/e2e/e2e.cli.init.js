"use strict";

var assert  = require("chai").assert;
var fs      = require("fs");
var path    = require("path");

var pkg     = require(path.resolve("package.json"));
var cli     = require(path.resolve(pkg.bin));

describe("E2E CLI init test", function () {

    before(function (done) {
        cli({
            cli: {
                input: ["init"],
                flags: {}
            },
            cb: done
        });
    });

    after(function (done) {
        fs.unlink("bs-config.js", done);
    });

    it("creates a config file in cwd", function () {
        assert.equal(fs.existsSync("bs-config.js"), true);
    });
});
