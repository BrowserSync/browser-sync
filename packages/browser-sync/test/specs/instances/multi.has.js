var browserSync = require("../../../");

var assert = require("chai").assert;

describe("E2E multi instance has", function() {
    it("returns true if an instance exists", function() {
        browserSync.reset();
        browserSync.create("ts");
        assert.isTrue(browserSync.has("ts"));
    });
    it("returns false if an instance does not exist", function() {
        browserSync.reset();
        assert.isFalse(browserSync.has("ts"));
        browserSync.create("ts2");
        assert.isTrue(browserSync.has("ts2"));
        assert.isFalse(browserSync.has("ts"));
    });
});
