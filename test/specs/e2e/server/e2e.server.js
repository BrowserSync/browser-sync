var browserSync = require("../../../../");

var request = require("supertest");
var assert = require("chai").assert;

describe("E2E server test", function() {
    this.timeout(5000);

    var instance;

    before(function(done) {
        browserSync.reset();

        var config = {
            server: {
                baseDir: "test/fixtures",
                index: "index.htm"
            },
            ghostMode: {
                clicks: false,
                scroll: false
            },
            logLevel: "silent",
            open: false,
            files: ["*.html"]
        };

        instance = browserSync(config, function(err) {
            if (err) {
                throw err;
            }
            done();
        }).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("serves files with the snippet added", function(done) {
        assert.isString(instance.options.get("snippet"));

        request(instance.server)
            .get("/index.html")
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
