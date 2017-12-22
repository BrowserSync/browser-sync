var browserSync = require("../../../");

var sinon = require("sinon");
var assert = require("chai").assert;

describe("API: .reload() with multi instances", function() {
    var clock, bs1, bs2, emitter1, emitter2;

    before(function(done) {
        browserSync.reset();

        browserSync
            .create("Server 1")
            .init({ logLevel: "silent" }, function(err, bs) {
                bs1 = bs;
                emitter1 = sinon.spy(bs.events, "emit");
                browserSync
                    .create("Server 2")
                    .init({ logLevel: "silent" }, function(err, bs) {
                        bs2 = bs;
                        emitter2 = sinon.spy(bs.events, "emit");
                        done();
                    });
            });

        clock = sinon.useFakeTimers();
    });

    afterEach(function() {
        clock.now = 0;
    });

    after(function() {
        bs1.cleanup();
        bs2.cleanup();
        clock.restore();
    });

    it("should be callable with no args & perform a reload", function() {
        assert.doesNotThrow(function() {
            browserSync.get("Server 1").reload();
            browserSync.get("Server 2").reload();
        });
    });
});
