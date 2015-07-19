"use strict";

var browserSync = require("../../../index");

var request     = require("supertest");
var assert      = require("chai").assert;
var page        = require("fs").readFileSync("test/fixtures/index.html", "utf-8");

describe("E2E `serveStatic` option", function () {

    var bs;

    before(function (done) {
        browserSync.reset();
        var config = {
            logLevel: "silent",
            online:    false,
            serveStatic: ["test/fixtures"]
        };
        bs = browserSync(config, done).instance;
    });

    after(function () {
        bs.cleanup();
    });

    it("can serve static files regardless of running mode", function (done) {
        request(bs.server)
            .get("/index.html")
            .expect(200)
            .end(function (err, res) {
                assert.equal(res.text, page);
                done();
            });
    });
});
