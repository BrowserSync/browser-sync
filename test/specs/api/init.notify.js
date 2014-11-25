"use strict";

var browserSync = require("../../../");

var sinon       = require("sinon");

describe("API: .notify() - Public Notify Method", function () {

    var emitterStub;

    before(function () {
        emitterStub = sinon.stub(browserSync.emitter, "emit");
    });

    afterEach(function () {
        emitterStub.reset();
    });

    after(function () {
        emitterStub.restore();
    });

    it("should emit the browser:notify event", function () {
        browserSync.notify("HI");
        sinon.assert.calledWithExactly(emitterStub, "browser:notify", {message: "HI", timeout: 2000});
    });
    it("should emit the browser:notify event (2)", function () {
        browserSync.notify("HI There");
        sinon.assert.calledWithExactly(emitterStub, "browser:notify", {message: "HI There", timeout: 2000});
    });
    it("should emit the browser:notify event with a timeout", function () {
        browserSync.notify("HI There", 3000);
        sinon.assert.calledWithExactly(emitterStub, "browser:notify", {message: "HI There", timeout: 3000});
    });
    it("should NOT emit the browser:notify event if a message was not provided", function () {
        browserSync.notify();
        sinon.assert.notCalled(emitterStub);
    });
});
