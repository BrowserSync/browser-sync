var browserSync = require("../../../");

var request = require("supertest");
var assert = require("chai").assert;

describe("E2E server test", function() {
    this.timeout(5000);

    var bs;

    before(function(done) {
        browserSync.reset();

        var config = {
            online: false,
            logLevel: "silent",
            open: false,
            server: "test/fixtures"
        };

        bs = browserSync(config, done).instance;
    });

    after(function() {
        bs.cleanup();
    });

    it("serves files with the snippet added", function(done) {
        var snippet = bs.getOption("snippet");

        assert.isString(snippet);

        request(bs.server)
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, snippet);
                done();
            });
    });

    it("serves the client script", function(done) {
        request(bs.server)
            .get(bs.options.getIn(["scriptPaths", "versioned"]))
            .expect(200)
            .end(function(err, res) {
                assert.include(res.text, "window.___browserSync___ = {}");
                done();
            });
    });
});
