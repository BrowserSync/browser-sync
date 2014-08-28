"use strict";

var browserSync = require("../../../index");

var sinon   = require("sinon");

describe("E2E Events test", function () {

    var instance;

    before(function (done) {
        instance = browserSync.init([], {
            open: false,
            debugInfo: false
        }, done);
    });

    after(function () {
        instance.cleanup();
    });

    it("Should register internal events", function () {

        var spy = sinon.spy(instance.io.sockets, "emit");

        instance.events.emit("file:reload", {path: "somepath.css"});

        sinon.assert.calledWithExactly(spy, "file:reload", {path: "somepath.css"});

        spy.restore();
    });
});
