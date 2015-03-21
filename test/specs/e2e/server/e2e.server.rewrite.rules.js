"use strict";

var browserSync = require("../../../../index");

var request = require("supertest");
var assert  = require("chai").assert;

describe("E2E server test with rewrite rules", function () {

    var instance;

    before(function (done) {

        browserSync.reset();

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            rewriteRules: [
                {
                    match: /Forms/g,
                    fn: function () {
                        return "Shane's forms";
                    }
                }
            ],
            logLevel: "silent",
            open: false
        };

        instance = browserSync.init(config, done).instance;
    });

    after(function () {
        instance.cleanup();
    });

    it("serves files with HTML rewritten", function (done) {

        request(instance.server)
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "Shane's forms");
                done();
            });
    });
});
