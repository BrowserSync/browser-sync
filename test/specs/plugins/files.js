"use strict";

var browserSync = require("../../../index");

var assert  = require("chai").assert;

describe("Plugins: Watching Files:", function () {

    it("should add a namespaced watcher when given as plugin config", function (done) {

        var config = {
            debugInfo: false,
            open: false,
            files: "test.html"
        };

        var PLUGIN_NAME = "KITTENZ";

        browserSync.use({
            plugin: function (bs) {
                bs.events.on("file:changed", function (data) {
                    assert.equal(data.namespace, PLUGIN_NAME);
                    instance.cleanup();
                    done();
                });
            },
            "plugin:name": PLUGIN_NAME
        }, {files: "test.html"});

        var instance = browserSync(config, function (err, bs) {
            assert.equal(Object.keys(bs.watchers).length, 2);
            assert.ok(bs.watchers[PLUGIN_NAME]);
            instance.events.emit("file:changed", {namespace: PLUGIN_NAME});
        });
    });

    it("should only add watchers if globs given", function (done) {

        var config = {
            debugInfo: false,
            open: false
        };

        browserSync.use({
            plugin: function () {}
        }, {files: "test.html"});

        var instance = browserSync(config, function (err, bs) {
            assert.equal(Object.keys(bs.watchers).length, 1);
            instance.cleanup();
            done();
        });
    });

    it("should only add watchers if globs given", function (done) {

        var config = {
            debugInfo: false,
            open: false
        };

        browserSync.use({
            plugin: function () {}
        });

        var instance = browserSync(config, function (err, bs) {
            assert.equal(Object.keys(bs.watchers).length, 0);
            instance.cleanup();
            done();
        });
    });
});