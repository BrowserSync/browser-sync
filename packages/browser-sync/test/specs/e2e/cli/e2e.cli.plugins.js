var path = require("path");
var assert = require("chai").assert;
var browserSync = require(path.resolve("./"));

var pkg = require(path.resolve("package.json"));
var cli = require(path.resolve(pkg.bin)).default;

describe("E2E CLI `plugins` arg", function() {
    it("allows plugins to be registered by 'require' name only", function(done) {
        browserSync.reset();
        cli({
            cli: {
                input: ["start"],
                flags: {
                    logLevel: "silent",
                    open: false,
                    plugins: ["bs-snippet-injector"]
                }
            },
            cb: function(err, bs) {
                if (err) return done(err);
                var plugin = bs.getUserPlugin("Snippet Injector");
                assert.equal(plugin.name, "Snippet Injector");
                assert.equal(plugin.active, true);
                bs.cleanup();
                done();
            }
        });
    });
    it("allows plugins to be registered by 'require' name + opts", function(done) {
        browserSync.reset();
        cli({
            cli: {
                input: ["start"],
                flags: {
                    logLevel: "silent",
                    open: false,
                    plugins: ["bs-snippet-injector?files[]=*.html"]
                }
            },
            cb: function(err, bs) {
                var plugin = bs.getUserPlugin("Snippet Injector");
                assert.equal(plugin.name, "Snippet Injector");
                assert.equal(plugin.active, true);
                assert.deepEqual(plugin.opts.files, ["*.html"]);
                bs.cleanup();
                done();
            }
        });
    });
    it("allows plugins to be registered by 'path'", function(done) {
        browserSync.reset();
        cli({
            cli: {
                input: ["start"],
                flags: {
                    logLevel: "silent",
                    open: false,
                    plugins: ["./test/fixtures/plugin.js"]
                }
            },
            cb: function(err, bs) {
                bs.cleanup();
                done();
            }
        });
    });
});
