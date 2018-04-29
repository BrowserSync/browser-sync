var path = require("path");
var request = require("supertest");
var assert = require("chai").assert;
var browserSync = require(path.resolve("./"));

var pkg = require(path.resolve("package.json"));
var cli = require(path.resolve(pkg.bin)).default;

describe("E2E CLI Snippet test", function() {
    var instance;

    before(function(done) {
        browserSync.reset();

        cli({
            cli: {
                input: ["start"],
                flags: {
                    logLevel: "silent"
                }
            },
            cb: function(err, bs) {
                instance = bs;
                done();
            }
        });
    });
    after(function() {
        instance.cleanup();
    });
    it("serves versioned browser-sync client js", function(done) {
        request(instance.server)
            .get(instance.options.getIn(["scriptPaths", "versioned"]))
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, "window.___browserSync___ = {}");
                done();
            });
    });
    it("serves browser-sync client js", function(done) {
        request(instance.server)
            .get(instance.options.getIn(["scriptPaths", "path"]))
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, "window.___browserSync___ = {}");
                done();
            });
    });
});
