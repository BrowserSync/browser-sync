var browserSync = require("../../../");

var assert = require("chai").assert;

describe("Plugins: Retrieving user plugins when given inline", function() {
    var instance;
    var PLUGIN_REQUIRE = "bs-snippet-injector";
    var PLUGIN_NAME = "Snippet Injector";

    before(function(done) {
        browserSync.reset();

        var config = {
            logLevel: "silent",
            plugins: [PLUGIN_REQUIRE]
        };

        instance = browserSync(config, done).instance;
    });
    after(function() {
        instance.cleanup();
    });
    it("Should access to only the user-specified plugins (1)", function(done) {
        assert.equal(instance.getUserPlugins().length, 1);
        done();
    });
    it("Should access to only the user-specified plugins (2)", function(done) {
        var plugin = instance.getUserPlugins()[0];
        assert.equal(plugin.name, PLUGIN_NAME);
        done();
    });
});
