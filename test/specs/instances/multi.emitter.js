var browserSync = require("../../../");

var assert = require("chai").assert;

describe("E2E multi instance emitter access", function() {
    it("has access to the singleton emitter", function(done) {
        browserSync.reset();

        browserSync({ logLevel: "silent" }, function() {
            assert.doesNotThrow(function() {
                browserSync.emitter.emit("some:event");
                done();
            });
        });
    });
});
