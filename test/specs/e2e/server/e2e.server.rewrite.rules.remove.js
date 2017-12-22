var browserSync = require("../../../../");

var request = require("supertest");
var assert = require("chai").assert;

describe("E2E server test with rewrite rules removed on the fly", function() {
    it("serves files with HTML rewritten", function(done) {
        browserSync.reset();
        browserSync.init(
            {
                server: {
                    baseDir: "test/fixtures"
                },
                rewriteRules: [{ match: "kittie", replace: "shane" }],
                logLevel: "silent",
                open: false
            },
            function(err, bs) {
                bs.addRewriteRule({
                    id: "myrule",
                    match: /Forms/g,
                    fn: function() {
                        return "Shane's forms";
                    }
                });

                request(bs.server)
                    .get("/index.html")
                    .set("accept", "text/html")
                    .expect(200)
                    .end(function(err, res) {
                        assert.include(res.text, "Shane's forms");

                        bs.removeRewriteRule("myrule");

                        request(bs.server)
                            .get("/index.html")
                            .set("accept", "text/html")
                            .expect(200)
                            .end(function(err, res) {
                                assert.notInclude(res.text, "Shane's forms");
                                done();
                            });
                    });
            }
        );
    });
});
