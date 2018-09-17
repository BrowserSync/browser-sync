var browserSync = require("../../../");
var sinon = require("sinon");

describe("File Watcher Module - reloadDelay", function() {
    it("emits reload event with 2000 delay", function(done) {
        browserSync.reset();
        var scheduler = require("../../utils").getScheduler();
        var config = {
            server: "test/fixtures",
            open: false,
            logLevel: "silent",
            reloadDelay: 1000,
            online: false,
            files: "test/fixtures/*.html",
            debug: {
                scheduler: scheduler
            }
        };
        browserSync(config, function(err, bs) {
            var stub = sinon.stub(bs.io.sockets, "emit");
            var fn = bs.watchers.core.watchers[0]._events.all;

            fn("change", "core.css");

            sinon.assert.notCalled(stub.withArgs("file:reload"));

            // Advance virtual time beyond the delay
            scheduler.advanceTo(1501);

            sinon.assert.calledOnce(stub.withArgs("file:reload"));

            bs.cleanup();
            done();
        });
    });
    it("calls browser:reload with a delay", function(done) {
        browserSync.reset();
        var scheduler = require("../../utils").getScheduler();
        var config = {
            server: "test/fixtures",
            open: false,
            logLevel: "silent",
            reloadDelay: 500,
            online: false,
            files: "test/fixtures/*.html",
            debug: {
                scheduler: scheduler
            }
        };
        browserSync(config, function(err, bs) {
            var stub = sinon.stub(bs.io.sockets, "emit");
            var fn = bs.watchers.core.watchers[0]._events.all;

            fn("change", "index.html");

            // before delay
            scheduler.advanceTo(999);

            sinon.assert.notCalled(stub.withArgs("browser:reload"));

            // Advance virtual time beyond the delay
            scheduler.advanceTo(1000);

            sinon.assert.calledOnce(stub.withArgs("browser:reload"));

            bs.cleanup();

            done();
        });
    });
});
