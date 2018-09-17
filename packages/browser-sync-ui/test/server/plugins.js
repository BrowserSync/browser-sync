/*jshint -W079 */
var browserSync = require("browser-sync");
var ui          = require("../../index");
var assert      = require("chai").assert;
var path        = require("path");
var isMap       = require("immutable").Map.isMap;

describe("Can resolve Browsersync plugins", function() {

    it("can return plugins with added meta data", function(done) {

        browserSync.reset();
        browserSync.use(ui);
        var plugin = {
            module: path.resolve(__dirname, "../", "fixtures/plugin")
        };
        browserSync({
            server: "test/fixtures",
            logLevel: "silent",
            open: false,
            plugins: [plugin]
        }, function (err, bs) {

            assert.equal(bs.ui.bsPlugins.size, 1);
            assert.isTrue(isMap(bs.ui.bsPlugins.get(0).get("pkg")));
            var clientJs = bs.ui.bsPlugins.get(0).get("client:js").toJS();
            assert.equal(Object.keys(clientJs).length, 1);
            var first = clientJs[Object.keys(clientJs)[0]];
            assert.include(first, "const PLUGIN_NAME = \"Test Plugin\";");
            bs.cleanup();
            done();
        });
    });

    it("can return plugins from non-module", function(done) {

        browserSync.reset();
        browserSync.use(ui);
        var plugin = {
            module: {
                plugin: function () {
                },
                "plugin:name": "Test inline plugin"
            }
        };
        browserSync({
            server: "test/fixtures",
            logLevel: "silent",
            open: false,
            plugins: [plugin]
        }, function (err, bs) {

            assert.equal(bs.ui.bsPlugins.size, 1);
            assert.equal(bs.ui.bsPlugins.get(0).get("name"), "Test inline plugin");

            bs.cleanup();
            done();
        });
    });

    it("Does not blow up when Plugin does not contain any UI", function(done) {

        browserSync.reset();
        browserSync.use(ui);
        var plugin = {
            module: path.resolve(__dirname, "../", "fixtures/plugin-noui")
        };
        browserSync({
            server: "test/fixtures",
            logLevel: "silent",
            open: false,
            plugins: [plugin]
        }, function (err, bs) {
            assert.equal(bs.ui.bsPlugins.size, 1);
            assert.isTrue(require("immutable").Map.isMap(bs.ui.bsPlugins.get(0).get("pkg")));
            bs.cleanup();
            done();
        });
    });

    it("Does not blow up when mixed plugins used together", function(done) {

        browserSync.reset();
        browserSync.use(ui);
        var plugin1 = {
            module: path.resolve(__dirname, "../", "fixtures/plugin")
        };
        var plugin2 = {
            module: path.resolve(__dirname, "../", "fixtures/plugin-noui")
        };
        browserSync({
            server: "test/fixtures",
            logLevel: "silent",
            open: false,
            plugins: [plugin1, plugin2]
        }, function (err, bs) {
            assert.equal(bs.ui.bsPlugins.size, 2);
            assert.isTrue(require("immutable").Map.isMap(bs.ui.bsPlugins.get(0).get("pkg")));
            var clientJs = bs.ui.bsPlugins.get(0).get("client:js").toJS();
            assert.equal(Object.keys(clientJs).length, 1);
            bs.cleanup();
            done();
        });
    });
});

