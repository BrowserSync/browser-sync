var browserSync = require("../../../");

var assert = require("chai").assert;

describe("API: .sockets", function() {
    it("has access before Browsersync is running via stubs", function(done) {
        browserSync.reset();
        var bs = browserSync.create();
        bs.init(
            {
                logLevel: "silent"
            },
            function(err, bs) {
                bs.cleanup();
                done();
            }
        );
        assert.isFunction(bs.sockets.on);
        assert.isFunction(bs.sockets.emit);
    });
    it("has access after Browsersync is running", function(done) {
        browserSync.reset();
        var bs = browserSync.create();
        bs.init(
            {
                logLevel: "silent"
            },
            function(err, _bs) {
                assert.isFunction(bs.sockets.emit);
                assert.isFunction(bs.sockets.on);
                _bs.cleanup();
                done();
            }
        );
    });
    it("has access before Browsersync is running via main module export + stubs", function(done) {
        browserSync.reset();
        var bs = browserSync(
            {
                logLevel: "silent"
            },
            function(err, bs) {
                bs.cleanup();
                done();
            }
        );
        assert.isFunction(bs.sockets.on);
        assert.isFunction(bs.sockets.emit);
    });
});
