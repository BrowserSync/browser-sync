var browserSync = require("../../../");

var assert = require("chai").assert;

describe("E2E script with/without async attribute", function() {
    it("serves with async", function(done) {
        browserSync.reset();
        var config = { open: false };
        browserSync(config, function(err, bs) {
            assert.include(bs.options.get("snippet"), "async");
            bs.cleanup();
            done();
        });
    });
    it("serves without async", function(done) {
        browserSync.reset();
        var config = {
            open: false,
            snippetOptions: {
                async: false
            }
        };
        browserSync(config, function(err, bs) {
            assert.notInclude(bs.options.get("snippet"), "async");
            bs.cleanup();
            done();
        });
    });
});
