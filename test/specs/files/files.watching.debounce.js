"use strict";

var browserSync = require("../../../");
var sinon       = require("sinon");
var assert      = require("chai").assert;

describe("File Watcher Module - reloadDebounce = 0", function () {
    var bs, clock, stub, data;
    before(function (done) {
        browserSync.reset();
        var config = {
            server: "test/fixtures",
            open: false,
            logLevel: "silent",
            reloadDebounce: 0,
            online: false
        };
        clock = sinon.useFakeTimers();
        bs = browserSync(config, function () {
            stub = sinon.stub(bs.io.sockets, "emit");
            done();
        }).instance;
    });
    beforeEach(function () {
        data = {path: "/index.html"};
        clock.now = 0;
    });
    after(function () {
        clock.restore();
        bs.io.sockets.emit.restore();
        bs.cleanup();
    });
    afterEach(function () {
        stub.reset();
    });
    it("Fires as fast as possible with no debounce", function (done) {
        bs.events.emit("file:reload", data);
        clock.tick();
        bs.events.emit("file:reload", data);
        clock.tick();
        assert.isTrue(stub.withArgs("browser:reload").calledTwice); // should be called for each
        done();
    });
});

describe("File Watcher Module - reloadDebounce = 1000", function () {
    var bs, clock, stub, data;
    before(function (done) {
        browserSync.reset();
        var config = {
            server: "test/fixtures",
            open: false,
            logLevel: "silent",
            reloadDebounce: 1000,
            online: false
        };
        clock = sinon.useFakeTimers();
        bs = browserSync(config, function () {
            stub = sinon.stub(bs.io.sockets, "emit");
            done();
        }).instance;
    });
    beforeEach(function () {
        data = {path: "/index.html"};
        clock.now = 0;
    });
    after(function () {
        clock.restore();
        bs.io.sockets.emit.restore();
        bs.cleanup();
    });
    afterEach(function () {
        stub.reset();
    });
    it("limits events to a 1000 interval", function (done) {
        bs.events.emit("file:reload", data);
        clock.tick(50);
        bs.events.emit("file:reload", data);
        clock.tick(50);
        bs.events.emit("file:reload", data);
        clock.tick(50);
        bs.events.emit("file:reload", data);
        clock.tick(1000);
        assert.isTrue(stub.withArgs("browser:reload").calledOnce);
        done();
    });
});
