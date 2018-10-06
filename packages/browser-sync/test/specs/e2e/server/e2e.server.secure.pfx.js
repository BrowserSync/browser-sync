var browserSync = require("../../../../");

var request = require("supertest");
var path = require("path");
var assert = require("chai").assert;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

describe("E2E TLS server with PFX certs test", function() {
    this.timeout(15000);

    var instance;

    before(function(done) {
        browserSync.reset();

        this.timeout(15000);

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            https: {
                pfx: path.resolve("./certs/browsersync.pfx")
            },
            logLevel: "silent",
            open: false
        };

        instance = browserSync.init(config, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("serves files with the snippet added", function(done) {
        assert.isString(instance.options.get("snippet"));

        request(instance.options.getIn(["urls", "local"]))
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, instance.options.get("snippet"));
                done();
            });
    });

    it("serves the client script", function(done) {
        request(instance.options.getIn(["urls", "local"]))
            .get(instance.options.getIn(["scriptPaths", "versioned"]))
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, "window.___browserSync___ = {}");
                done();
            });
    });
});
