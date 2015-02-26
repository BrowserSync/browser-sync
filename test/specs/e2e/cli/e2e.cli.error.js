"use strict";

var path        = require("path");
var assert      = require("chai").assert;
var browserSync = require(path.resolve("./"));

var pkg         = require(path.resolve("package.json"));
var cli         = require(path.resolve(pkg.bin));

describe("E2E CLI - fail on invalid config", function () {

    var stub;

    before(function (done) {

        browserSync.reset();
        stub = require("sinon").stub(process, "exit");
        cli({
            cli: {
                input: ["start"],
                flags: {
                    logLevel: "silent",
                    server: true,
                    proxy: "http://bbc.co.uk"
                }
            },
            cb: function () {
                done();
            }
        });
    });
    it("should fail with exit code 1 when both proxy & server config given", function (done) {
        require("sinon").assert.called(stub);
        assert.equal(stub.getCall(0).args[0], 1);
        process.exit.restore();
        done();
    });
});
