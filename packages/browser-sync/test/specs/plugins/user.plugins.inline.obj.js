var browserSync = require("../../../");

var assert = require("chai").assert;

describe("Plugins: Retrieving user plugins when given inline as object", function() {
    var instance;
    var PLUGIN_NAME = "Test Plugin";

    it("has access to user options", function(done) {
        browserSync.reset();

        var config = {
            logLevel: "silent",
            plugins: [
                {
                    module: {
                        plugin: function() {},
                        "plugin:name": PLUGIN_NAME
                    },
                    options: {
                        files: "*.html"
                    }
                }
            ]
        };

        browserSync(config, function(err, bs) {
            assert.equal(bs.getUserPlugins().length, 1);
            var plugin = bs.getUserPlugins()[0];
            assert.equal(plugin.name, PLUGIN_NAME);
            assert.equal(plugin.opts.files, "*.html");
            bs.cleanup();
            done();
        });
    });
});
