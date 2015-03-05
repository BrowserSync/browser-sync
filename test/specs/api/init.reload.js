"use strict";

var browserSync = require("../../../");

var sinon       = require("sinon");
var assert      = require("chai").assert;
var File        = require("vinyl");

describe("API: .reload()", function () {

    var emitterStub, clock, bs;

    before(function (done) {
        browserSync.reset();
        bs = browserSync({logLevel:"silent"}, function () {
            emitterStub = sinon.spy(bs.emitter, "emit");
            done();
        });
        clock = sinon.useFakeTimers();
    });

    afterEach(function () {
        emitterStub.reset();
        clock.now = 0;
    });

    after(function () {
        bs.cleanup();
        clock.restore();
        emitterStub.restore();
    });

    it("should be callable with no args & perform a reload", function () {
        browserSync.reload();
        sinon.assert.calledWithExactly(emitterStub, "browser:reload");
    });
    it("should accept a file path as a string", function () {
        browserSync.reload("css/core.css");
        sinon.assert.calledWithExactly(emitterStub, "file:changed", {
            path: "css/core.css",
            log: true,
            namespace: "core"
        });
    });
    it("only calls reload once if the array contains a filepath that will cause a reload", function () {
        browserSync.reload(["css/core.css", "index.html"]);
        var calls = emitterStub.withArgs("browser:reload");
        assert.equal(calls.callCount, 1);
        sinon.assert.calledWithExactly(emitterStub, "browser:reload");
    });
    it("calls reload multiple times if all items can be injected", function () {
        browserSync.reload(["css/core.css", "ie.css"]);
        var calls = emitterStub.withArgs("file:changed");
        assert.equal(calls.callCount, 2);
        sinon.assert.calledWithExactly(emitterStub, "file:changed", {
            path: "css/core.css",
            log: true,
            namespace: "core"
        });
        sinon.assert.calledWithExactly(emitterStub, "file:changed", {
            path: "ie.css",
            log: true,
            namespace: "core"
        });
    });
    it("should accept an array of file paths as strings", function () {
        browserSync.reload(["index.html", "css/core.css"]);
        sinon.assert.calledWithExactly(emitterStub, "browser:reload");
    });
    it("should reload browser if once:true given as arg", function () {
        var stream = browserSync.reload({stream: true, once: true});
        stream.write(new File({path: "styles.css"}));
        stream.write(new File({path: "styles2.css"}));
        stream.write(new File({path: "styles3.css"}));
        stream.end();
        sinon.assert.calledOnce(emitterStub);
        sinon.assert.calledWithExactly(emitterStub, "browser:reload");
    });
});
