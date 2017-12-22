var browserSync = require("../../../");

var assert = require("chai").assert;

describe("E2E multi instance init", function() {
    this.timeout(5000);

    var bs, config;

    before(function(done) {
        browserSync.reset();

        config = {
            online: false,
            logLevel: "silent",
            open: false,
            server: "test/fixtures"
        };

        bs = browserSync.create("first").init(config, done);
    });

    after(function() {
        bs.cleanup();
    });

    it("returns an error when attempting to init same instance twice", function(done) {
        browserSync.get("first").init(config, function(err) {
            assert.isTrue(err instanceof Error);
            done();
        });
    });
});
