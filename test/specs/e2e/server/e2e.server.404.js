var browserSync = require("../../../../");

var request = require("supertest");
var assert = require("chai").assert;

describe.skip("E2E server test - 404 pages", function() {
    this.timeout(5000);

    var instance;

    before(function(done) {
        browserSync.reset();

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            logLevel: "silent",
            open: false
        };

        instance = browserSync(config, done).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("serves files with the snippet added", function(done) {
        request(instance.server)
            .get("/erthert-404wewefq")
            .set("accept", "text/html")
            .expect(404)
            .end(function(err, res) {
                //console.log(res.statusCode);
                assert.notInclude(res.text, "Cannot GET /erthert-404.html");
                done();
            });
    });
});
