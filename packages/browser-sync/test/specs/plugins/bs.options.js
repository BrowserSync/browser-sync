var browserSync = require("../../../");

var assert = require("chai").assert;

describe("Plugins: Retrieving options via API", function() {
    it("has access to options", function(done) {
        browserSync.reset();

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            logLevel: "silent",
            open: false
        };

        browserSync.use(
            {
                plugin: function(opts, bs) {
                    assert.equal(opts.files, "*.css");
                    assert.ok(require("immutable").Map.isMap(bs.getOptions()));
                },
                "plugin:name": "test"
            },
            { files: "*.css" }
        );

        browserSync(config, function(err, bs) {
            assert.equal(bs.watchers.test.watchers.length, 1);
            bs.cleanup();
            done();
        });
    });
});
