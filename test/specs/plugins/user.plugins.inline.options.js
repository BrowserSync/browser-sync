"use strict";

var browserSync = require("../../../");

var assert  = require("chai").assert;

describe("Plugins: Retrieving user plugins when given inline with options", function () {

    var instance;
    var PLUGIN_NAME    = "HTML Injector";

    before(function (done) {

        browserSync.reset();

        var plugin = {
            "bs-html-injector": {
                files: "*.html"
            }
        };

        var config = {
            logLevel: "silent",
            plugins: [
                {
                    "bs-html-injector": {
                        files: "*.html"
                    }
                }
            ]
        };

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
});
