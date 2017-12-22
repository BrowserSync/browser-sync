var browserSync = require("../../../../");

var request = require("supertest");
var assert = require("chai").assert;

describe("E2E server test with rewrite rules", function() {
    it("serves files with HTML rewritten", function(done) {
        browserSync.reset();

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            rewriteRules: [
                {
                    match: /Forms/g,
                    fn: function() {
                        return "Shane's forms";
                    }
                }
            ],
            logLevel: "silent",
            open: false
        };

        browserSync.init(config, function(err, bs) {
            request(bs.server)
                .get("/index.html")
                .set("accept", "text/html")
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    assert.include(res.text, "Shane's forms");
                    bs.cleanup(done);
                });
        });
    });
    it("supports legacy boolean for rewriteRules", function(done) {
        browserSync.reset();

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            rewriteRules: false,
            logLevel: "silent",
            open: false
        };

        browserSync.init(config, function(err, bs) {
            request(bs.server)
                .get("/index.html")
                .set("accept", "text/html")
                .expect(200)
                .end(function(err) {
                    if (err) return done(err);
                    bs.cleanup(done);
                });
        });
    });
});
