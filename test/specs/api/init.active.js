var browserSync = require("../../../");

var assert = require("chai").assert;

describe("API: .active - Retrieving the active state of browserSync", function() {
    before(function() {
        browserSync.reset();
    });

    it("should know the inactive state of BrowserSync", function() {
        assert.equal(browserSync.active, false);
    });

    describe("Setting the active state", function() {
        var instance;

        before(function(done) {
            browserSync.reset();
            var config = {
                logLevel: "silent",
                open: false
            };

            instance = browserSync(config, function() {
                done();
            });
        });

        after(function() {
            instance.cleanup();
        });

        it("should know the active State of BrowserSync", function() {
            assert.equal(browserSync.active, true);
        });
    });
});
