var browserSync = require("../../../");

var sinon = require("sinon");
var assert = require("chai").assert;
var File = require("vinyl");

describe("API: .reload()", function() {
    it("should accept a file path as a string", function(done) {
        browserSync.reset();

        var scheduler = require("../../utils").getScheduler();

        browserSync(
            {
                logLevel: "silent",
                debug: {
                    scheduler: scheduler
                }
            },
            function(err, bs) {
                var emitterStub = sinon.spy(bs.emitter, "emit");

                browserSync.reload("css/core.css");
                scheduler.advanceTo(500);

                sinon.assert.calledWithExactly(emitterStub, "file:changed", {
                    path: "css/core.css",
                    basename: "core.css",
                    log: true,
                    namespace: "core",
                    event: "change",
                    ext: "css"
                });

                bs.cleanup();

                done();
            }
        );
    });
    it("only calls reload once if the array contains a filepath that will cause a reload", function(done) {
        browserSync.reset();

        var scheduler = require("../../utils").getScheduler();

        browserSync(
            {
                logLevel: "silent",
                debug: {
                    scheduler: scheduler
                }
            },
            function(err, bs) {
                var emitterStub = sinon.spy(bs.emitter, "emit");

                browserSync.reload(["css/core.css", "index.html"]);
                scheduler.advanceTo(2000);

                var calls = emitterStub.withArgs("browser:reload");
                assert.equal(calls.callCount, 1);
                sinon.assert.calledWith(emitterStub, "browser:reload");

                bs.cleanup();
                done();
            }
        );
    });
    it("calls reload multiple times if all items can be injected", function(done) {
        browserSync.reset();

        var scheduler = require("../../utils").getScheduler();

        browserSync(
            {
                logLevel: "silent",
                debug: {
                    scheduler: scheduler
                }
            },
            function(err, bs) {
                var emitterStub = sinon.spy(bs.emitter, "emit");

                browserSync.reload(["css/core.css", "ie.css"]);
                scheduler.advanceTo(2000);

                var calls = emitterStub.withArgs("file:changed");
                assert.equal(calls.callCount, 2);

                sinon.assert.calledWithExactly(emitterStub, "file:changed", {
                    path: "css/core.css",
                    basename: "core.css",
                    log: true,
                    namespace: "core",
                    event: "change",
                    ext: "css"
                });
                sinon.assert.calledWithExactly(emitterStub, "file:changed", {
                    path: "ie.css",
                    basename: "ie.css",
                    log: true,
                    namespace: "core",
                    event: "change",
                    ext: "css"
                });

                bs.cleanup();
                done();
            }
        );
    });
    it("should accept wildcards for files extensions eg: *.css", function(done) {
        browserSync.reset();

        var scheduler = require("../../utils").getScheduler();

        browserSync(
            {
                logLevel: "silent",
                debug: {
                    scheduler: scheduler
                }
            },
            function(err, bs) {
                var emitterStub = sinon.spy(bs.emitter, "emit");

                browserSync.reload("*.css");

                scheduler.advanceTo(500);

                sinon.assert.calledWithExactly(emitterStub, "file:changed", {
                    path: "*.css",
                    basename: "*.css",
                    log: true,
                    namespace: "core",
                    event: "change",
                    ext: "css"
                });

                bs.cleanup(done);
            }
        );
    });
    /**
     * BACKWARDS COMPATIBILITY:
     * This is an old signature that, whilst we must continue to support,
     * is now deferred to the stream method.
     */
    it("should reload browser if once:true given as arg", function(done) {
        browserSync.reset();

        var scheduler = require("../../utils").getScheduler();

        browserSync(
            {
                logLevel: "silent",
                debug: {
                    scheduler: scheduler
                }
            },
            function(err, bs) {
                var emitterStub = sinon.spy(bs.emitter, "emit");
                var stream = browserSync.reload({ stream: true, once: true });
                stream.write(new File({ path: "styles.css" }));
                stream.write(new File({ path: "styles2.css" }));
                stream.write(new File({ path: "styles3.css" }));
                stream.end();
                scheduler.advanceTo(600);
                sinon.assert.calledWithExactly(emitterStub, "_browser:reload");
                sinon.assert.calledWithExactly(emitterStub, "browser:reload");
                bs.cleanup(done);
            }
        );
    });
});
