var path = require("path");
var browserSync = require(path.resolve("./"));

var pkg = require(path.resolve("package.json"));
var sinon = require("sinon");
var assert = require("chai").assert;
var cli = require(path.resolve(pkg.bin)).default;

describe("E2E CLI `reload` with no files arg", function() {
    it("should make a http request to the protocol with no files arg", function(done) {
        browserSync.reset();
        var scheduler = require("../../utils").getScheduler();
        browserSync.create().init(
            {
                server: "test/fixtures",
                open: false,
                debug: { scheduler: scheduler }
            },
            function(err, bs) {
                var spy = sinon.spy(bs.events, "emit");

                cli({
                    cli: {
                        input: ["reload"],
                        flags: {
                            port: bs.options.get("port")
                        }
                    },
                    cb: function() {
                        scheduler.advanceTo(600);
                        sinon.assert.calledWithExactly(spy, "browser:reload");
                        bs.cleanup();
                        done();
                    }
                });
            }
        );
    });

    it("should make a http request with files arg", function(done) {
        browserSync.reset();
        var scheduler = require("../../utils").getScheduler();
        browserSync.create().init(
            {
                server: "test/fixtures",
                open: false,
                debug: { scheduler: scheduler }
            },
            function(err, bs) {
                var spy = sinon.spy(bs.events, "emit");

                cli({
                    cli: {
                        input: ["reload"],
                        flags: {
                            port: bs.options.get("port"),
                            files: "core.css"
                        }
                    },
                    cb: function() {
                        scheduler.advanceTo(600);
                        sinon.assert.calledWithExactly(spy, "file:changed", {
                            path: "core.css",
                            basename: "core.css",
                            log: true,
                            namespace: "core",
                            event: "change",
                            ext: "css"
                        });
                        bs.cleanup();
                        done();
                    }
                });
            }
        );
    });
    it("should make a http request with files arg over HTTPS", function(done) {
        browserSync.reset();
        var scheduler = require("../../utils").getScheduler();
        browserSync.create().init(
            {
                server: "test/fixtures",
                open: false,
                https: true,
                debug: { scheduler: scheduler }
            },
            function(err, bs) {
                var spy = sinon.spy(bs.events, "emit");

                cli({
                    cli: {
                        input: ["reload"],
                        flags: {
                            url: bs.options.getIn(["urls", "local"]),
                            files: "core.css"
                        }
                    },
                    cb: function() {
                        scheduler.advanceTo(600);
                        sinon.assert.calledWithExactly(spy, "file:changed", {
                            path: "core.css",
                            basename: "core.css",
                            ext: "css",
                            log: true,
                            namespace: "core",
                            event: "change"
                        });
                        bs.cleanup();
                        done();
                    }
                });
            }
        );
    });
    it.skip("should handle ECONNREFUSED errors nicely", function(done) {
        cli({
            cli: {
                input: ["reload"],
                flags: {}
            },
            cb: function(err) {
                assert.equal(err.code, "ECONNREFUSED");
                assert.equal(
                    err.message,
                    "Browsersync not running at http://localhost:3000"
                );
                done();
            }
        });
    });
    it.skip("should handle non 200 code results", function(done) {
        cli({
            cli: {
                input: ["reload"],
                flags: {}
            },
            cb: function(err) {
                assert.equal(err.code, "ECONNREFUSED");
                assert.equal(
                    err.message,
                    "Browsersync not running at http://localhost:3000"
                );
                done();
            }
        });
    });
});
