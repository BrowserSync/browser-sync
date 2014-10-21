"use strict";

var browserSync = require("../../../index");

var assert  = require("chai").assert;

describe("Plugins: Retrieving user plugins", function () {

    var PLUGIN_NAME = "KITTENZ";
    var instance;

    before(function (done) {

        var config = {
            logLevel: "silent",
            open: false
        };

        browserSync.use({
            plugin: function () { /* noop */ },
            "plugin:name": PLUGIN_NAME
        });

        instance = browserSync(config, done);
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
        assert.equal(plugin["plugin:name"], PLUGIN_NAME);
        done();
    });
});
