var browserSync = require("../../../");

var assert = require("chai").assert;

describe.skip("Plugins: Retrieving user plugins when given inline with options", function() {
    var instance;
    var PLUGIN_NAME = "Snippet Injector";

    before(function(done) {
        browserSync.reset();

        var config = {
            logLevel: "silent",
            plugins: [
                {
                    module: "bs-snippet-injector",
                    options: {
                        files: "*.html"
                    }
                }
            ]
        };

        instance = browserSync(config, done).instance;
    });
    after(function() {
        instance.cleanup();
    });
    it("Should access to only the user-specified plugins", function() {
        assert.equal(instance.getUserPlugins().length, 1);
    });
    it("Should have access to only the user-specified plugins", function() {
        var plugin = instance.getUserPlugins()[0];
        assert.equal(plugin.name, PLUGIN_NAME);
    });
    it("should have access to user provided opts", function() {
        var plugin = instance.getUserPlugins()[0];
        assert.equal(plugin.opts.files, "*.html");
    });
});
