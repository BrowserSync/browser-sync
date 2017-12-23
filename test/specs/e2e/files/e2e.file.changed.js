var browserSync = require("../../../../");

var path = require("path");
var sinon = require("sinon");
var assert = require("chai").assert;

describe("E2E Responding to events", function() {
    var instance, socketsStub, scheduler;

    before(function(done) {
        browserSync.reset();
        scheduler = require("../../../utils").getScheduler();

        var config = {
            server: {
                baseDir: path.join(__dirname, "../../fixtures")
            },
            files: ["test/fixtures/assets/*.css"],
            logLevel: "silent",
            open: false,
            debug: {scheduler: scheduler}
        };

        instance = browserSync(config, function(err, bs) {
            socketsStub = sinon.stub(bs.io.sockets, "emit");
            done();
        }).instance;
    });

    afterEach(function() {
        socketsStub.reset();
        scheduler.clock = 0;
    });

    after(function() {
        instance.io.sockets.emit.restore();
        instance.cleanup();
    });

    it("fires the file:reload event to the browser", function() {
        // Emit the event as it comes from the file-watcher
        instance.events.emit("file:changed", {
            path: "styles.css",
            event: "change",
            log: true,
            namespace: "core"
        });

        scheduler.advanceTo(1000);

        var eventName = socketsStub.getCall(0).args[0];
        var args = socketsStub.getCall(0).args[1];

        assert.equal(eventName, "file:reload"); // check correct event sent to client
        assert.equal(args.basename, "styles.css"); // Check the asset name is sent
        assert.isFalse(instance.paused);
    });

    it("fires the file:reload event to the browser when wildcard given", function() {
        // Emit the event as it comes from the file-watcher
        instance.events.emit("file:changed", {
            path: "*.css",
            event: "change",
            log: true,
            namespace: "core"
        });

        scheduler.advanceTo(1000);

        var eventName = socketsStub.getCall(0).args[0];
        var args = socketsStub.getCall(0).args[1];

        assert.equal(eventName, "file:reload"); // check correct event sent to client
        assert.equal(args.path, "*.css"); // Check the asset name is sent
        assert.equal(args.basename, "*.css"); // Check the asset name is sent
        assert.equal(args.ext, "css"); // Check the asset name is sent
        assert.isFalse(instance.paused);
    });

    it("doesn't fire the file:reload event to the browser when paused", function() {
        instance.paused = true;

        // Emit the event as it comes from the file-watcher
        instance.events.emit("file:changed", {
            path: "styles.css",
            log: true,
            event: "change",
            namespace: "core"
        });

        scheduler.advanceTo(500);

        assert.isTrue(socketsStub.withArgs("file:reload").notCalled); // should not be called
        assert.isTrue(instance.paused);

        instance.paused = false;

        //// Emit the event as it comes from the file-watcher
        instance.events.emit("file:changed", {
            path: "styles.css",
            log: true,
            event: "change",
            namespace: "core"
        });

        scheduler.advanceTo(1000);

        assert.isTrue(socketsStub.withArgs("file:reload").called);
        assert.isFalse(instance.paused);
    });

    it("fires the browser:reload event to the browser", function() {
        // Emit the event as it comes from the file-watcher
        instance.events.emit("browser:reload");

        scheduler.advanceTo(1000);

        var eventName = socketsStub.getCall(0).args[0];

        assert.equal(eventName, "browser:reload"); // check correct event sent to client
    });

    it("fires the browser:notify event to the browser", function() {
        // Emit the event as it comes from the file-watcher
        instance.events.emit("browser:notify", "DATA");

        sinon.assert.calledWithExactly(socketsStub, "browser:notify", "DATA");
    });
});
