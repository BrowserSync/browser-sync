var browserSync = require("../../../");
const chalk = require("chalk");

var assert = require("chai").assert;

describe("API: .init - don't not call init when already running.", function() {
    it("should know the active State of BrowserSync", function(done) {
        browserSync.reset();
        browserSync(
            {
                logLevel: "silent",
                open: false
            },
            function(err, bs) {
                var spy = require("sinon").spy(console, "log");
                browserSync({ server: "test/fixtures" });
                var arg = spy.getCall(0).args;
                assert.include(arg[0], chalk.yellow("You tried to start Browsersync twice!"));
                assert.include(arg[1], "To create multiple instances, use");
                assert.include(arg[2], chalk.cyan('browserSync.create().init()'));
                console.log.restore();
                bs.cleanup();
                done();
            }
        );
    });
    it("should init with null as second param", function(done) {
        browserSync.reset();
        var bs = browserSync(
            {
                logLevel: "silent",
                open: false
            },
            null
        );
        bs.emitter.on("service:running", function() {
            assert.ok(bs.instance.options.get("urls"));
            bs.cleanup();
            done();
        });
    });
    it("should init with undefined as second param", function(done) {
        browserSync.reset();
        var bs = browserSync(
            {
                logLevel: "silent",
                open: false
            },
            undefined
        );
        bs.emitter.on("service:running", function() {
            assert.ok(bs.instance.options.get("urls"));
            bs.cleanup();
            done();
        });
    });
});
