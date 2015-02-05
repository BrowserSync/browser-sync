"use strict";

var path        = require("path");
var utils       = require("../../../../lib/utils");
var assert      = require("chai").assert;
var browserSync = require(path.resolve("./"));

var pkg         = require(path.resolve("package.json"));
var cli         = require(path.resolve(pkg.bin));

describe("E2E CLI `files` arg - multi globs", function () {

    var instance;

    before(function (done) {

        browserSync.reset();

        cli({
            cli: {
                input: ["start"],
                flags: {
                    logLevel: "silent",
                    open: false,
                    files: "*.html, css/*.css"
                }
            },
            cb: function (err, bs) {
                instance = bs;
                done();
            }
        });
    });
    after(function () {
        instance.cleanup();
    });
    it("Converts cli files arg to correct namespaced watchers", function () {
        assert.equal(instance.options.getIn(["files", "core"]).size, 2);
        assert.equal(instance.watchers.core.glob.size, 2);

        assert.isTrue(utils.isList(instance.watchers.core.glob));
    });
});

describe("E2E CLI `files` arg, single glob", function () {

    var instance;

    before(function (done) {

        browserSync.reset();

        cli({
            cli: {
                input: ["start"],
                flags: {
                    logLevel: "silent",
                    open: false,
                    files: "*.html"
                }
            },
            cb: function (err, bs) {
                instance = bs;
                done();
            }
        });
    });
    after(function () {
        instance.cleanup();
    });
    it("Converts cli files arg to correct namespaced watchers", function () {
        assert.equal(instance.options.getIn(["files", "core"]).size, 1);
        assert.equal(instance.watchers.core.glob.size, 1);

        assert.isTrue(utils.isList(instance.watchers.core.glob));
    });
});
