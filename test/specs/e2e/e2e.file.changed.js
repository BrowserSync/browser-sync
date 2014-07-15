"use strict";

var browserSync   = require("../../../index");

var sinon   = require("sinon");
var assert  = require("chai").assert;

describe("E2E Responding to events", function () {

    var instance;

    before(function (done) {

        var config = {
            server: {
                baseDir: __dirname + "/../../fixtures"
            },
            files: ["test/fixtures/assets/*.css"],
            debugInfo: false,
            open: false
        };

        instance = browserSync.init(config, done);
    });

    after(function () {
        instance.cleanup();
    });

    it("fires the file:reload event to the browser", function () {

        // Stub the socket
        var stub = sinon.stub(instance.io.sockets, "emit");

        // Emit the event as it comes from the file-watcher
        instance.events.emit("file:changed", {path: "styles.css", log: true, namespace: "core"});

        var eventName = stub.getCall(0).args[0];
        var args      = stub.getCall(0).args[1];

        assert.equal(eventName, "file:reload"); // check correct event sent to client
        assert.equal(args.assetFileName, "styles.css"); // Check the asset name is sent

        stub.restore();
    });

    it("fires the browser:reload event to the browser", function () {

        // Stub the socket
        var stub = sinon.stub(instance.io.sockets, "emit");

        // Emit the event as it comes from the file-watcher
        instance.events.emit("browser:reload");

        var eventName = stub.getCall(0).args[0];

        assert.equal(eventName, "browser:reload"); // check correct event sent to client

        stub.restore();
    });
});