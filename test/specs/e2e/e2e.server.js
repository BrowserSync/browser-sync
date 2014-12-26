"use strict";

var browserSync = require("../../../index");

var request = require("supertest");
var assert  = require("chai").assert;

describe("E2E server test", function () {

    this.timeout(5000);

    var instance;

    before(function (done) {

        browserSync.reset();

        var config = {
            server: "test/fixtures",
            logLevel: "silent",
            open: false
        };

        instance = browserSync(config, done).instance;
    });

    after(function () {
        instance.cleanup();
    });

    it.only("serves files with the snippet added", function (done) {

        assert.isString(instance.options.snippet);

        request(instance.server)
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, instance.options.snippet);
                done();
            });
    });

    it("serves the client script", function (done) {

        request(instance.server)
            .get(instance.options.scriptPaths.versioned)
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "Connected to BrowserSync");
                done();
            });
    });
});
