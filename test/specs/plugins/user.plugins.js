"use strict";

var browserSync = require("../../../index");

var assert  = require("chai").assert;

describe("Plugins: Retrieving user plugins", function () {

    var PLUGIN_NAME = "KITTENZ";
    var instance;

    before(function (done) {

        browserSync.reset();
        var config = {
            logLevel: "silent",
            open: false
        };

        browserSync.use({
            plugin: function () { /* noop */ },
            "plugin:name": PLUGIN_NAME
        });

        instance = browserSync(config, done).instance;
    });
    after(function () {
        instance.cleanup();
    });
    it("Should access to only the user-specified plugins", function (done) {
        assert.equal(instance.getUserPlugins().length, 1);
        done();
    });
    it("Should access to only the user-specified plugins", function (done) {
        var plugin = instance.getUserPlugins()[0];
        assert.equal(plugin.name, PLUGIN_NAME);
        done();
    });
    it("Disable/re-enable a plugin from event", function (done) {
        assert.isTrue(instance.pluginManager.getPlugin(PLUGIN_NAME)._enabled);
        instance.events.emit("plugins:configure", {
            name: PLUGIN_NAME,
            active: false
        });
        assert.isFalse(instance.options.userPlugins[0].active);
        assert.isFalse(instance.pluginManager.getPlugin(PLUGIN_NAME)._enabled);

        instance.events.emit("plugins:configure", {
            name: PLUGIN_NAME,
            active: true
        });
        assert.isTrue(instance.options.userPlugins[0].active);
        assert.isTrue(instance.pluginManager.getPlugin(PLUGIN_NAME)._enabled);
        done();
    });
});
