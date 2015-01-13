"use strict";

var browserSync = require("../../../index");

var assert  = require("chai").assert;
var request = require("supertest");

describe("Plugins: Should be able to call `serveFile` on the instance when in server mode", function () {

    var PLUGIN_NAME = "KITTENZ";
    var instance;

    before(function (done) {

        browserSync.reset();

        var config = {
            logLevel: "silent",
            open: false,
            server: "test/fixtures"
        };

        browserSync.use({
            plugin: function (opts, bs) {
                bs.serveFile("/shane", {
                    type: "text/css",
                    content: "Hi there"
                });
                done();
            },
            "plugin:name": PLUGIN_NAME
        });

        instance = browserSync(config).instance;
    });
    after(function () {
        instance.cleanup();
    });
    it("should serve the file", function (done) {
        request(instance.server)
            .get("/shane")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "Hi there");
                assert.equal(res.headers["content-type"], "text/css");
                done();
            });
    });
});

describe("Plugins: Should be able to call `serveFile` on the instance when in snippet mode", function () {

    var PLUGIN_NAME = "KITTENZ";
    var instance;

    before(function (done) {

        browserSync.reset();

        var config = {
            logLevel: "silent",
            open: false
        };

        browserSync.use({
            plugin: function (opts, bs) {
                bs.serveFile("/shane", {
                    type: "text/css",
                    content: "Hi there"
                });
                done();
            },
            "plugin:name": PLUGIN_NAME
        });

        instance = browserSync(config).instance;
    });
    after(function () {
        instance.cleanup();
    });
    it("should serve the file", function (done) {
        request(instance.server)
            .get("/shane")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "Hi there");
                assert.equal(res.headers["content-type"], "text/css");
                done();
            });
    });
});
