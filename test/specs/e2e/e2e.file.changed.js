"use strict";

var browserSync   = require("../../../index");

var path    = require("path");
var sinon   = require("sinon");
var assert  = require("chai").assert;

describe("E2E Responding to events", function () {

    var instance, socketsStub, clock;

    before(function (done) {

        browserSync.reset();

        var config = {
            server: {
                baseDir: path.resolve(__dirname, "../../fixtures")
            },
            files: ["test/fixtures/assets/*.css"],
            logLevel: "silent",
            open: false
        };

        instance = browserSync(config, function (err, bs) {
            socketsStub = sinon.stub(bs.io.sockets, "emit");
            done();
        }).instance;

        clock = sinon.useFakeTimers();
    });

    afterEach(function () {
        socketsStub.reset();
    });

    after(function () {
        instance.io.sockets.emit.restore();
        instance.cleanup();
        clock.restore();
    });

    it("fires the file:reload event to the browser", function () {

        // Emit the event as it comes from the file-watcher
        instance.events.emit("file:changed", {path: "styles.css", event: "change", log: true, namespace: "core"});

        clock.tick();

        var eventName = socketsStub.getCall(0).args[0];
        var args      = socketsStub.getCall(0).args[1];

        assert.equal(eventName, "file:reload");         // check correct event sent to client
        assert.equal(args.assetFileName, "styles.css"); // Check the asset name is sent
        assert.isFalse(instance.paused);
    });

    it("doesn't fire the file:reload event to the browser when paused", function () {
        instance.paused = true;

        // Emit the event as it comes from the file-watcher
        instance.events.emit("file:changed", {path: "styles.css", log: true, event: "change", namespace: "core"});

        clock.tick();

        assert.isTrue(socketsStub.withArgs("file:reload").notCalled); // should not be called
        assert.isTrue(instance.paused);

        instance.paused = false;

        //// Emit the event as it comes from the file-watcher
        instance.events.emit("file:changed", {path: "styles.css", log: true, event: "change", namespace: "core"});

        clock.tick();

        assert.isTrue(socketsStub.withArgs("file:reload").called);
        assert.isFalse(instance.paused);
    });

    it("Sets `log: false` if `log` is undefined in event", function () {

        // Emit the event as it comes from the file-watcher
        instance.events.emit("file:changed", {path: "styles.css", event: "change", namespace: "core"});

        clock.tick();

        var args = socketsStub.getCall(0).args[1];

        assert.isTrue(args.log);
    });

    it("fires the browser:reload event to the browser", function () {

        // Emit the event as it comes from the file-watcher
        instance.events.emit("browser:reload");

        clock.tick();

        var eventName = socketsStub.getCall(0).args[0];

        assert.equal(eventName, "browser:reload"); // check correct event sent to client
    });

    it("fires the browser:notify event to the browser", function () {

        // Emit the event as it comes from the file-watcher
        instance.events.emit("browser:notify", "DATA");

        sinon.assert.calledWithExactly(socketsStub, "browser:notify", "DATA");
    });
});
