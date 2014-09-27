"use strict";

var browserSync   = require("../../../index");

var sinon   = require("sinon");
var assert  = require("chai").assert;

describe("E2E Responding to events", function () {

    var instance, socketsStub;

    before(function (done) {

        var config = {
            server: {
                baseDir: __dirname + "/../../fixtures"
            },
            files: ["test/fixtures/assets/*.css"],
            debugInfo: false,
            open: false
        };

        instance = browserSync.init(config, function () {
            socketsStub = sinon.stub(instance.io.sockets, "emit");
            done();
        });
    });

    afterEach(function () {
        socketsStub.reset();
    });
    after(function () {
        socketsStub.restore();
        instance.cleanup();
    });

    it("fires the file:reload event to the browser", function () {

        // Emit the event as it comes from the file-watcher
        instance.events.emit("file:changed", {path: "styles.css", log: true, namespace: "core"});

        var eventName = socketsStub.getCall(0).args[0];
        var args      = socketsStub.getCall(0).args[1];

        assert.equal(eventName, "file:reload");         // check correct event sent to client
        assert.equal(args.assetFileName, "styles.css"); // Check the asset name is sent
    });

    it("Sets `log: false` if `log` is undefined in event", function () {

        // Emit the event as it comes from the file-watcher
        instance.events.emit("file:changed", {path: "styles.css", namespace: "core"});

        var args = socketsStub.getCall(0).args[1];

        assert.isTrue(args.log);
    });

    it("fires the browser:reload event to the browser", function () {

        // Emit the event as it comes from the file-watcher
        instance.events.emit("browser:reload");

        var eventName = socketsStub.getCall(0).args[0];

        assert.equal(eventName, "browser:reload"); // check correct event sent to client
    });
    it("fires the browser:notify event to the browser", function () {

        // Emit the event as it comes from the file-watcher
        instance.events.emit("browser:notify", "DATA");

        sinon.assert.calledWithExactly(socketsStub, "browser:notify", "DATA");
    });
});
