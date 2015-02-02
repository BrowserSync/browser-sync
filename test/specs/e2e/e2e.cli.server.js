"use strict";

var path        = require("path");
var request     = require("supertest");
var assert      = require("chai").assert;
var browserSync = require(path.resolve("./"));

var pkg     = require(path.resolve("package.json"));
var cli     = require(path.resolve(pkg.bin));

describe("E2E CLI server test", function () {

    var instance;

    before(function (done) {

        browserSync.reset();

        cli({
            cli: {
                input: ["start"],
                flags: {
                    server: "test/fixtures",
                    open: false,
                    online: false,
                    logLevel: "silent"
                }
            },
            cb: function (err, bs) {
                instance = bs;
                done();
            }
        });
    });
    after(function () {
        instance.cleanup();
    });
    it("serves index.html + snippet injected", function (done) {
        request(instance.server)
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, instance.options.get("snippet"));
                done();
            });
    });
    it("serves browser-sync client js", function (done) {
        request(instance.server)
            .get(instance.options.getIn(["scriptPaths", "versioned"]))
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "Connected to BrowserSync");
                done();
            });
    });
});
