var browserSync = require("../../../");
var assert = require("chai").assert;

describe("Plugins: User interface with error on init", function() {
    it("Should start even when UI errors", function(done) {
        browserSync.reset();
        browserSync.use({
            "plugin:name": "UI",
            plugin: function(opts, bs, cb) {
                cb(new Error("Could not start"));
            }
        });

        var config = {
            logLevel: "silent",
            server: "test/fixtures",
            open: false
        };

        browserSync(config, function(err, bs) {
            assert.isUndefined(bs.ui);
            bs.cleanup();
            done();
        });
    });
});
