"use strict";

var browserSync = require("../../../../index");

var request = require("supertest");
var path    = require("path");
var assert  = require("chai").assert;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

describe("E2E TLS server with custom certs test", function () {

    this.timeout(15000);

    var instance;

    before(function (done) {

        browserSync.reset();

        this.timeout(15000);

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            https: {
                key:  path.resolve("./lib/server/certs/server.key"),
                cert: path.resolve("./lib/server/certs/server.crt")
            },
            logLevel: "silent",
            open: false
        };

        instance = browserSync.init(config, done).instance;
    });

    after(function () {
        instance.cleanup();
    });

    it("serves files with the snippet added", function (done) {

        assert.isString(instance.options.get("snippet"));

        request(instance.server)
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                console.log(res);
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
