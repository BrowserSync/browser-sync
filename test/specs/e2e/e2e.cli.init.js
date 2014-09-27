"use strict";

var path     = require("path");
var fs       = require("fs");
var sinon    = require("sinon");
var assert   = require("chai").assert;
var exec     = require("child_process").exec;

var index   = path.resolve(__dirname + "/../../../index.js");

describe.skip("E2E CLI init test", function () {

    var bs;

    before(function (done) {

        var out = [];
        var stub = sinon.stub(fs, "writeFile").yields(null);

        bs = exec("node " + index + " init").on("close", function () {
            assert.equal(out.length, 2);
            stub.restore();
            done();
        });
        bs.stdout.on("data", function (data) {
            out.push(data);
        });
    });

    it("returns the snippet", function (done) {
        done();
    });
});
