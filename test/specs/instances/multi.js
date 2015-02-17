"use strict";

var browserSync = require("../../../");

var request = require("supertest");
var assert  = require("chai").assert;

describe("E2E server test", function () {

    this.timeout(5000);

    var bs, bs2;

    before(function (done) {

        browserSync.reset();

        var config = {
            online: false,
            logLevel: "silent",
            open: false,
            server: "test/fixtures"
        };

        bs = browserSync.create("first").init(config, function () {
            bs2 = browserSync.create("second").init(config, done);
        });
    });

    after(function () {
        bs.cleanup();
        bs2.cleanup();
    });

    it("serves files with the snippet added", function (done) {

        var snippet = bs.getOption("snippet");

        assert.isString(snippet);

        request(bs.server)
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, snippet);
            });

        var snippet2 = bs2.getOption("snippet");

        assert.isString(snippet2);

        request(bs2.server)
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(res.text.indexOf(snippet2) > -1);
                done();
            });
    });

    it("serves the client script", function (done) {

        request(bs.server)
            .get(bs.options.getIn(["scriptPaths", "versioned"]))
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "Connected to BrowserSync");
            });

        request(bs2.server)
            .get(bs2.options.getIn(["scriptPaths", "versioned"]))
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "Connected to BrowserSync");
                done();
            });
    });
});
