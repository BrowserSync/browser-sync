var browserSync = require("../../../");

var sinon = require("sinon");

describe("E2E Events test", function() {
    var instance, clock;

    before(function(done) {
        browserSync.reset();
        instance = browserSync(
            {
                open: false,
                logLevel: "silent",
                logSnippet: false
            },
            done
        ).instance;
        clock = sinon.useFakeTimers();
    });

    after(function() {
        instance.cleanup();
        clock.restore();
    });

    it("Should register internal events", function() {
        var spy = sinon.spy(instance.io.sockets, "emit");

        instance.events.emit("file:reload", {
            path: "somepath.css",
            fileExtension: "css"
        });

        clock.tick();

        sinon.assert.calledWithExactly(spy, "file:reload", {
            path: "somepath.css",
            fileExtension: "css"
        });

        spy.restore();
    });
});
