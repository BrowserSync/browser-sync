/*jshint -W079 */
var browserSync = require("browser-sync");
var ui          = require("../../index");
var assert      = require("chai").assert;
var path        = require("path");

describe("Resolving templates loaded via plugins", function() {

    it("can load a single template", function(done) {

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
            assert.include(bs.ui.templates, "id=\"test-bs-plugin/test.directive.html");
            assert.include(bs.ui.templates, "<h1>Test markup from Test Directive</h1>");
            assert.include(bs.ui.clientJs, "const PLUGIN_NAME = \"Test Plugin\";");

            bs.cleanup();
            done();
        });
    });
    it("can load multiple templates", function (done) {
        browserSync.reset();
        browserSync.use(ui);
        var plugin = {
            module: path.resolve(__dirname, "../", "fixtures/plugin-multi-templates")
        };
        browserSync({
            server: "test/fixtures",
            logLevel: "silent",
            open: false,
            plugins: [plugin]
        }, function (err, bs) {
            assert.include(bs.ui.templates, "id=\"test-bs-plugin/test.directive.html");
            assert.include(bs.ui.templates, "id=\"test-bs-plugin/test.list.html");
            assert.include(bs.ui.templates, "<h1>Test markup from Test Directive</h1>");
            assert.include(bs.ui.templates, "<h1>Test markup from Test LIST Directive</h1>");
            assert.include(bs.ui.clientJs, "const PLUGIN_NAME = \"Test Plugin\";");
            assert.include(bs.ui.clientJs, "const PLUGIN_NAME = \"Test Plugin file 2\";");

            bs.cleanup();
            done();
        });
    });
});

