var path = require("path");
var assert = require("chai").assert;
var browserSync = require(path.resolve("./"));

var pkg = require(path.resolve("package.json"));
var cli = require(path.resolve(pkg.bin)).default;

describe("E2E CLI `files` arg - multi globs", function() {
    it("Converts cli files arg to correct namespaced watchers", function(done) {
        browserSync.reset();
        cli({
            cli: {
                input: ["start"],
                flags: {
                    logLevel: "silent",
                    open: false,
                    files: ["*.html, css/*.css"]
                }
            },
            cb: function(err, bs) {
                assert.equal(
                    bs.options.getIn(["files", "core", "globs"]).size,
                    2
                );
                assert.isTrue(Array.isArray(bs.watchers.core.watchers));
                bs.cleanup();
                done();
            }
        });
    });
});

describe("E2E CLI `files` arg, single glob", function() {
    it("Converts cli files arg to correct namespaced watchers", function(done) {
        browserSync.reset();
        cli({
            cli: {
                input: ["start"],
                flags: {
                    logLevel: "silent",
                    open: false,
                    files: ["*.html"]
                }
            },
            cb: function(err, bs) {
                assert.equal(
                    bs.options.getIn(["files", "core", "globs"]).size,
                    1
                );
                assert.isTrue(Array.isArray(bs.watchers.core.watchers));
                bs.cleanup();
                done();
            }
        });
    });
});

describe("E2E CLI `files` arg, with commas", function() {
    it("Converts cli files arg", function(done) {
        browserSync.reset();
        cli({
            cli: {
                input: ["start"],
                flags: {
                    logLevel: "silent",
                    open: false,
                    files: ["*.css,*.html"]
                }
            },
            cb: function(err, bs) {
                assert.equal(
                    bs.options.getIn(["files", "core", "globs"]).size,
                    2
                );
                assert.isTrue(Array.isArray(bs.watchers.core.watchers));
                bs.cleanup();
                done();
            }
        });
    });
});
