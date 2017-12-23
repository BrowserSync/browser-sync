var browserSync = require("../../../");
var sinon = require("sinon");
var assert = require("chai").assert;

describe("File Watcher Module - reloadDebounce", function() {
    it("only calls file:reload once within the time window", function(done) {
        browserSync.reset();
        var scheduler = require("../../utils").getScheduler();
        var config = {
            server: "test/fixtures",
            open: false,
            logLevel: "silent",
            reloadDebounce: 1000,
            online: false,
            files: "test/fixtures/*.html",
            debug: {
                scheduler: scheduler
            }
        };
        browserSync(config, function(err, bs) {
            var fn = bs.watchers.core.watchers[0]._events.all;
            var stub = sinon.stub(bs.io.sockets, "emit");

            fn("change", "index.html");

            // debounced by 1000, so shouldn't fire right away
            sinon.assert.notCalled(stub);

            // now we advance the clock
            scheduler.advanceBy(1000);

            // And now we should see that the method was called
            sinon.assert.called(stub);

            bs.cleanup();
            done();
        });
    });
    it("waits for 1000 event silence before reloading", function(done) {
        browserSync.reset();
        var scheduler = require("../../utils").getScheduler();
        var config = {
            server: "test/fixtures",
            files: "test/fixtures/*.html",
            open: false,
            logLevel: "silent",
            reloadDebounce: 1000,
            online: false,
            debug: {
                scheduler: scheduler
            }
        };
        browserSync(config, function(err, bs) {
            var fn = bs.watchers.core.watchers[0]._events.all;
            var stub = sinon.stub(bs.io.sockets, "emit");

            fn("change", "index.html");

            scheduler.advanceTo(900);

            // Should not be called yet
            sinon.assert.notCalled(stub.withArgs("browser:reload"));

            // Should now be called as we're over the debounce
            scheduler.advanceTo(1001);

            assert.equal(stub.withArgs("browser:reload").getCalls().length, 1);

            bs.cleanup();
            done();
        });
    });
});
