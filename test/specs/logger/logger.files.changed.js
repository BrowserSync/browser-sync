var browserSync = require("../../../");
var logger = require("../../../dist/logger").logger;
var callbacks = require("../../../dist/logger").callbacks;
var sinon = require("sinon");

describe("Logs file change events following stream:changed", function() {
    var spy;
    before(function() {
        spy = sinon.stub(logger, "info");
    });
    afterEach(function() {
        spy.reset();
    });
    after(function() {
        logger.info.restore();
    });
    it("should log when straem:changed", function(done) {
        browserSync.reset();
        browserSync(
            {
                server: "./app",
                files: "*.html",
                open: false
            },
            function(err, bs) {
                spy.reset();
                callbacks["stream:changed"](bs, { changed: ["core.css"] });
                sinon.assert.called(spy);
                bs.cleanup(done);
            }
        );
    });
    it("should NOT log when stream:changed but logFileChanges = false", function(done) {
        browserSync.reset();
        browserSync(
            {
                server: "./app",
                files: "*.html",
                logFileChanges: false,
                open: false
            },
            function(err, bs) {
                spy.reset();
                callbacks["stream:changed"](bs, { changed: ["core.css"] });
                sinon.assert.notCalled(spy);
                bs.cleanup(done);
            }
        );
    });
    it("should log when file:reload", function(done) {
        browserSync.reset();
        browserSync(
            {
                server: "./app",
                files: "*.html",
                open: false
            },
            function(err, bs) {
                spy.reset();
                callbacks["file:reload"](bs, {
                    log: true,
                    path: "style.css",
                    cwd: "/users/shane"
                });
                sinon.assert.called(spy);
                bs.cleanup(done);
            }
        );
    });
    it("should NOT log when file:reload but log:false", function(done) {
        browserSync.reset();
        browserSync(
            {
                server: "./app",
                files: "*.html",
                open: false
            },
            function(err, bs) {
                spy.reset();
                callbacks["file:reload"](bs, {
                    log: false,
                    path: "style.css",
                    cwd: "/users/shane"
                });
                sinon.assert.notCalled(spy);
                bs.cleanup(done);
            }
        );
    });
    it("should NOT log when options logFileChanges = false", function(done) {
        browserSync.reset();
        browserSync(
            {
                server: "./app",
                files: "*.html",
                logFileChanges: false,
                open: false
            },
            function(err, bs) {
                spy.reset();
                callbacks["file:reload"](bs, {
                    log: true,
                    path: "style.css",
                    cwd: "/users/shane"
                });
                sinon.assert.notCalled(spy);
                bs.cleanup(done);
            }
        );
    });
    it("should log when browser:reload", function(done) {
        browserSync.reset();
        browserSync(
            {
                server: "./app",
                files: "*.html",
                open: false
            },
            function(err, bs) {
                spy.reset();
                callbacks["browser:reload"](bs);
                sinon.assert.called(spy);
                bs.cleanup(done);
            }
        );
    });
    it("should NOT log when browser:reload but logFileChanges = false", function(done) {
        browserSync.reset();
        browserSync(
            {
                server: "./app",
                files: "*.html",
                logFileChanges: false,
                open: false
            },
            function(err, bs) {
                spy.reset();
                callbacks["browser:reload"](bs);
                sinon.assert.notCalled(spy);
                bs.cleanup(done);
            }
        );
    });
});
