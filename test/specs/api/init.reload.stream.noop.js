"use strict";

var browserSync = require("../../../");
var assert      = require("chai").assert;
var File        = require("vinyl");
var sinon       = require("sinon");

describe("API: .stream() noop", function () {

    before(function () {
        browserSync.reset();
    });

    it("should can handle a reload + stream call when there's no instance", function () {
        assert.doesNotThrow(function () {
            var stream = browserSync.stream();
            stream.write(new File({path: "styles.css"}));
            stream.end();
        });
    });
    it("should can handle a reload + stream call after there IS an instance", function (done) {
        var emitterStub;
        var bs = browserSync(function () {

            var stream = bs.stream();

            emitterStub = sinon.spy(bs.emitter, "emit");

            stream.write(new File({path: "styles.css"}));
            stream.end();

            sinon.assert.calledWithExactly(emitterStub, "file:changed", {
                path:      "styles.css",
                log:       false,
                namespace: "core"
            });
            done();
        });
    });
});
