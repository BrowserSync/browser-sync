var browserSync = require("../../../");

var assert = require("chai").assert;

describe("E2E multi instance get", function() {
    it("throws an error when the instance does not exist", function() {
        browserSync.reset();
        assert.throws(function() {
            browserSync.get("first").init();
        });
    });
});
