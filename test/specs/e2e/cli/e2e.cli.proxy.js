"use strict";

var path        = require("path");
var request     = require("supertest");
var assert      = require("chai").assert;
var connect     = require("connect");
var browserSync = require(path.resolve("./"));
var serveStatic = require("serve-static");

var pkg     = require(path.resolve("package.json"));
var cli     = require(path.resolve(pkg.bin));

describe("E2E CLI proxy test", function () {

    var instance, server;

    before(function (done) {

        browserSync.reset();
        var app = connect();
        app.use(serveStatic("./test/fixtures"));
        server = app.listen();
        var proxytarget = "http://localhost:" + server.address().port;

        cli({
            cli: {
                input: ["start"],
                flags: {
                    proxy: proxytarget,
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
        server.close();
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
describe("E2E CLI proxy test", function () {

    var instance;

    before(function (done) {

        browserSync.reset();

        cli({
            cli: {
                input: ["start"],
                flags: {
                    proxy: true, // this is: `browser-sync start --proxy`
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
    it("should fall back to snippet mode if no string given for proxy on cli", function () {
        assert.equal(instance.options.get("mode"), "snippet");
    });
});

describe("E2E CLI proxy test", function () {

    var instance;

    before(function (done) {

        browserSync.reset();

        cli({
            cli: {
                input: ["start"],
                flags: {
                    proxy: "localhost:8000/path/is/here", // this is: `browser-sync start --proxy localhost:8000/path/is/here`
                    logLevel: "silent",
                    open: false
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
    it("promote paths in the proxy to startPath option", function () {

        assert.equal(instance.options.get("startPath"), "/path/is/here");
    });
});
