var browserSync = require("../../../");
var assert = require("chai").assert;

describe("E2E options test - ready callback as option", function() {
    it("Calls the ready callback when read", function(done) {
        browserSync.reset();
        browserSync({
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            logLevel: "silent",
            callbacks: {
                ready: function(err, bs) {
                    bs.cleanup();
                    done();
                }
            }
        });
    });
    it("It has public instance bound to `this`", function(done) {
        browserSync.reset();
        browserSync({
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            logLevel: "silent",
            callbacks: {
                ready: function() {
                    var bs = this;
                    assert.isFunction(bs.reload);
                    assert.isFunction(bs.notify);
                    assert.isFunction(bs.watch);
                    bs.cleanup();
                    done();
                }
            }
        });
    });
});
