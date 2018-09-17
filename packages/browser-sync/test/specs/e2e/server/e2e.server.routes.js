var browserSync = require("../../../../");

var request = require("supertest");
var assert = require("chai").assert;

describe("E2E server test with routes", function() {
    var instance;

    before(function(done) {
        browserSync.reset();

        var config = {
            server: {
                baseDir: "test/fixtures",
                routes: {
                    "/shane": "test/fixtures",
                    "/kittie": "test/fixtures",
                    "/node_modules/": "node_modules"
                }
            },
            logLevel: "silent",
            open: false
        };

        instance = browserSync.init(config, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("serves files from the route with snippet added", function(done) {
        assert.isString(instance.options.get("snippet"));

        request(instance.server)
            .get("/shane/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, instance.options.get("snippet"));
                done();
            });
    });

    it("serves files from the route with snippet added", function(done) {
        assert.isString(instance.options.get("snippet"));

        request(instance.server)
            .get("/kittie/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, instance.options.get("snippet"));
                done();
            });
    });

    it("serves the client script", function(done) {
        request(instance.server)
            .get(instance.options.getIn(["scriptPaths", "versioned"]))
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, "window.___browserSync___ = {}");
                done();
            });
    });
});
