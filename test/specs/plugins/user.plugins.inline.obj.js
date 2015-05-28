"use strict";

var browserSync = require("../../../");

var assert  = require("chai").assert;

describe("Plugins: Retrieving user plugins when given inline as object", function () {

    var instance;
    var PLUGIN_NAME    = "Test Plugin";

    before(function (done) {

        browserSync.reset();

        var config = {
            logLevel: "silent",
            plugins: [
                {
                    module: {
                        plugin: function () {
                            done();
                        },
                        "plugin:name": PLUGIN_NAME
                    },
                    options: {
                        files: "*.html"
                    }
                }
            ]
        };

        instance = browserSync(config).instance;
    });
    after(function () {
        instance.cleanup();
    });
    it("Should access to only the user-specified plugins", function (done) {
        assert.equal(instance.getUserPlugins().length, 1);
        done();
    });
    it("Should have access to only the user-specified plugins", function (done) {
        var plugin = instance.getUserPlugins()[0];
        assert.equal(plugin.name, PLUGIN_NAME);
        done();
    });
    it("should have access to user provided opts", function (done) {
        var plugin = instance.getUserPlugins()[0];
        assert.equal(plugin.opts.files, "*.html");
        done();
    });
});
