var browserSync = require("../../../");
var hooks = require("../../../dist/hooks");
var events = require("events");
var path = require("path");
var sinon = require("sinon");
var assert = require("chai").assert;

var outpath = path.join(__dirname, "../../fixtures");

describe("File Watcher Module", function() {
    it("Passes options for chokidar", function(done) {
        browserSync.reset();
        browserSync.create().init(
            {
                logLevel: "silent",
                online: false,
                files: "css/*.css",
                watchOptions: {
                    debounceDelay: 4000
                }
            },
            function(err, bs) {
                assert.equal(bs.watchers.core.watchers.length, 1);
                assert.equal(
                    bs.watchers.core.watchers[0].options.debounceDelay,
                    4000
                );
                bs.cleanup();
                done();
            }
        );
    });
    it("Passes separate options for chokidar when multi given", function(done) {
        browserSync.reset();
        browserSync.create().init(
            {
                logLevel: "silent",
                online: false,
                files: [
                    "css/*.css",
                    {
                        match: "*.html",
                        fn: function(event) {
                            console.log(event);
                        },
                        options: {
                            interval: 100
                        }
                    }
                ],
                watchOptions: {
                    interval: 200
                }
            },
            function(err, bs) {
                assert.equal(bs.watchers.core.watchers.length, 2);
                assert.equal(
                    bs.watchers.core.watchers[0].options.interval,
                    200
                );
                assert.equal(
                    bs.watchers.core.watchers[1].options.interval,
                    100
                );
                bs.cleanup();
                done();
            }
        );
    });
    it("should emit events about changed files in core namespace", function(done) {
        var tempFile = path.join(outpath, "watch-func.txt");
        var called = false;

        browserSync.reset();

        // assert: it works if it calls done
        var bs = browserSync.create();

        bs.init(
            {
                files: [
                    {
                        options: {
                            ignoreInitial: true
                        },
                        match: tempFile,
                        fn: function(event, file) {
                            assert.equal(event, "change");
                            assert.equal(file, tempFile);
                            assert.isFunction(this.reload);
                            assert.isFunction(this.notify);
                            bs.cleanup();
                            if (!called) {
                                done();
                                called = true;
                            }
                        }
                    }
                ],
                ui: false,
                online: false,
                logSnippet: false,
                logLevel: "silent"
            },
            function(err, bs) {
                bs.watchers.core.watchers[0]._events.all("change", tempFile);
            }
        );
    });
    it("should emit events about added files when watchEvents added", function(done) {
        var tempFile = path.join(outpath, "watch-func.txt");
        var called = false;

        browserSync.reset();

        // assert: it works if it calls done
        var bs = browserSync.create();

        bs.init(
            {
                watchEvents: ["add"],
                files: [
                    {
                        options: {
                            ignoreInitial: true
                        },
                        match: tempFile,
                        fn: function(event, file) {
                            assert.equal(event, "add");
                            assert.equal(file, tempFile);
                            assert.isFunction(this.reload);
                            assert.isFunction(this.notify);
                            bs.cleanup();
                            if (!called) {
                                done();
                                called = true;
                            }
                        }
                    }
                ],
                ui: false,
                online: false,
                logSnippet: false,
                logLevel: "silent"
            },
            function(err, bs) {
                bs.watchers.core.watchers[0]._events.all("add", tempFile);
            }
        );
    });
    it("should allow obj literal with match & options, but without callback fn", function(done) {
        browserSync.reset();

        var tempFile = path.join(outpath, "watch-func.txt");

        // assert: it works if it calls done
        var bs = browserSync.create();

        bs.init(
            {
                files: [
                    {
                        options: {
                            ignoreInitial: true
                        },
                        match: tempFile
                    }
                ],
                ui: false,
                online: false,
                logSnippet: false,
                logLevel: "silent"
            },
            function(err, bs) {
                var spy = sinon.spy(bs.events, "emit");

                bs.watchers.core.watchers[0]._events.all("change", tempFile);

                var callArgs = spy.getCall(0).args;

                assert.equal(callArgs[0], "file:changed");
                assert.equal(callArgs[1].event, "change");
                assert.equal(callArgs[1].namespace, "core");

                bs.cleanup();

                done();
            }
        );
    });
    it("should allow arrays with , in API mode", function(done) {
        browserSync.reset();
        var bs = browserSync.create();

        bs.init(
            {
                files: ["test/fixtures/**/*.{css,html}"],
                ui: false,
                online: false,
                logSnippet: false,
                logLevel: "silent"
            },
            function(err, bs) {
                assert.equal(
                    bs.options.getIn(["files", "core", "globs"]).size,
                    1
                );
                bs.cleanup();
                done();
            }
        );
    });
});
