"use strict";

var browserSync = require("../../../../index");

var connect = require("connect");

var request = require("supertest");
var assert  = require("chai").assert;

describe("E2E server test with middleware", function () {

    var instance;

    before(function (done) {

        browserSync.reset();

        var middleware = connect();

        middleware.use("/custom/middleware", function (req, res) {
            res.end("<html><body></body></html>");
        });

        var config = {
            server: {
                baseDir: "test/fixtures",
                middleware: middleware
            },
            logLevel: "silent",
            open: false
        };

        instance = browserSync.init(config, done).instance;
    });

    after(function () {
        instance.cleanup();
    });

    it("serves files from the middleware with snippet added", function (done) {

        assert.isString(instance.options.get("snippet"));

        request(instance.server)
            .get("/custom/middleware")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, instance.options.get("snippet"));
                done();
            });
    });

    it("serves the client script", function (done) {

        request(instance.server)
            .get(instance.options.getIn(["scriptPaths", "versioned"]))
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "Connected to BrowserSync");
                done();
            });
    });
});
