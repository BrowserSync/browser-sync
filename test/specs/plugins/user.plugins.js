var browserSync = require("../../../");

var assert = require("chai").assert;

describe("Plugins: Retrieving user plugins", function() {
    var PLUGIN_NAME = "KITTENZ";
    var instance;

    before(function(done) {
        browserSync.reset();
        var config = {
            logLevel: "silent",
            open: false
        };

        browserSync.use(
            {
                plugin: function() {
                    /* noop */
                },
                "plugin:name": PLUGIN_NAME
            },
            { human: "Shane" }
        );

        instance = browserSync(config, done).instance;
    });
    after(function() {
        instance.cleanup();
    });
    it("Should access to only the user-specified plugins", function(done) {
        assert.equal(instance.getUserPlugins().length, 1);
        done();
    });
    it("Should access a single user-specified plugin by name", function(done) {
        assert.equal(instance.getUserPlugin(PLUGIN_NAME).name, PLUGIN_NAME);
        done();
    });
    it("Should return false when single user-specified plugin by name is requested, but does not exist", function(done) {
        assert.isFalse(instance.getUserPlugin("random-name"));
        done();
    });
    it("Should access to only the user-specified plugins", function(done) {
        var plugin = instance.getUserPlugins()[0];
        assert.equal(plugin.name, PLUGIN_NAME);
        done();
    });
    it("Disable/re-enable a plugin from event", function(done) {
        assert.isTrue(instance.pluginManager.getPlugin(PLUGIN_NAME)._enabled);
        instance.events.emit("plugins:configure", {
            name: PLUGIN_NAME,
            active: false
        });
        assert.isFalse(instance.options.get("userPlugins")[0].active);
        assert.isFalse(instance.pluginManager.getPlugin(PLUGIN_NAME)._enabled);

        instance.events.emit("plugins:configure", {
            name: PLUGIN_NAME,
            active: true
        });
        assert.isTrue(instance.options.get("userPlugins")[0].active);
        assert.isTrue(instance.pluginManager.getPlugin(PLUGIN_NAME)._enabled);
        done();
    });
    it("can set options on user plugins", function() {
        var plugin = instance.getUserPlugin(PLUGIN_NAME);

        assert.equal(plugin.opts.human, "Shane");

        instance.events.emit("plugins:opts", {
            name: PLUGIN_NAME,
            opts: {
                human: "kittie"
            }
        });

        assert.equal(instance.getUserPlugin(PLUGIN_NAME).opts.human, "kittie");
    });
});
