var path = require("path");
var browserSync = require(path.resolve("./"));
var pkg = require(path.resolve("package.json"));
var assert = require("chai").assert;
var sinon = require("sinon");
var fs = require("fs");
var cli = require(path.resolve(pkg.bin)).default;
var utils = require("../../../../dist/utils");

describe("CLI: reading config file from disk", function() {
    it("reads a config file", function(done) {
        browserSync.reset();
        cli({
            cli: {
                input: ["start"],
                flags: {
                    logLevel: "silent",
                    config: "test/fixtures/config/si-config.js",
                    open: false
                }
            },
            cb: function(err, bs) {
                assert.equal(
                    bs.options.getIn(["server", "baseDir", 0]),
                    "test/fixtures"
                );
                bs.cleanup();
                done();
            }
        });
    });
    it("returns an error if a config file does not exist", function(done) {
        var stub = require("sinon").stub(utils, "fail");
        browserSync.reset();
        cli({
            cli: {
                input: ["start"],
                flags: {
                    logLevel: "silent",
                    config: "test/fixtures/config/sioops.js",
                    open: false
                }
            },
            cb: function(err, bs) {
                var err = stub.getCall(0).args[1];
                assert.equal(
                    err.message,
                    "Configuration file 'test/fixtures/config/sioops.js' not found"
                );
                utils.fail.restore();
                bs.cleanup();
                done();
            }
        });
    });
});
