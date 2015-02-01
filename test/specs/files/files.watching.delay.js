"use strict";

var browserSync = require("../../../");
var sinon       = require("sinon");
var assert      = require("chai").assert;

describe("File Watcher Module - reloadDelay", function () {
    var bs, clock, stub, data;
    var delay = 2000;
    before(function (done) {
        browserSync.reset();
        var config = {
            server: "test/fixtures",
            open: false,
            logLevel: "silent",
            reloadDelay: delay,
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
    it("emits reload event with 2000 delay", function () {
        bs.events.emit("file:reload", data);
        bs.events.emit("file:reload", data);
        bs.events.emit("file:reload", data);
        bs.events.emit("file:reload", data);
        bs.events.emit("file:reload", data);
        bs.events.emit("file:reload", data);
        bs.events.emit("file:reload", data);
        bs.events.emit("file:reload", data);
        bs.events.emit("file:reload", data);
        clock.tick(1000);
        assert.isTrue(stub.withArgs("file:reload").notCalled); // should not be called
        clock.tick(1001); // 2001
        sinon.assert.calledOnce(stub);
    });
    it("emits a batch of file changes after a delay", function () {
        bs.events.emit("file:reload", {path: "core/core.css"});
        bs.events.emit("file:reload", {path: "core/ie.css"});
        clock.tick(3000);
        sinon.assert.calledTwice(stub);
    });
    it("only calls reload once if any file in queue would cause a reload", function () {
        bs.events.emit("file:reload", {path: "core/index.html"});
        bs.events.emit("file:reload", {path: "core/ie.css"});
        clock.tick(3000);
        sinon.assert.calledOnce(stub);
        sinon.assert.calledWith(stub, "browser:reload");
    });
    it("calls browser:reload with a delay", function () {
        bs.events.emit("browser:reload");
        bs.events.emit("browser:reload");
        bs.events.emit("browser:reload");
        sinon.assert.notCalled(stub);
        clock.tick(1000);
        sinon.assert.notCalled(stub);
        clock.tick(2000); // 2001
        sinon.assert.calledOnce(stub);
    });
});
