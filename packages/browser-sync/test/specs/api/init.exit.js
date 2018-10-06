var browserSync = require("../../../");

var assert = require("chai").assert;
var sinon = require("sinon");

describe("API: .exit() - Using the public exit method", function() {
    describe("should exit when BrowserSync is running.", function() {
        var instance;

        before(function(done) {
            browserSync.reset();
            var config = {
                logLevel: "silent",
                open: false
            };

            instance = browserSync(config, done);
        });

        after(function() {
            instance.cleanup();
        });

        it("should know the active State of BrowserSync", function() {
            var stub = sinon.stub(process, "exit");

            assert.equal(browserSync.active, true);

            browserSync.exit();

            assert.equal(browserSync.active, false);

            stub.restore();
        });
    });
});
