"use strict";

var browserSync = require("../../../index");

var request = require("supertest");
var _       = require("lodash");
var assert  = require("chai").assert;

describe("E2E server test with routes", function () {

    var instance;

    before(function (done) {

        var config = {
            server: {
                baseDir: "test/fixtures",
                routes: {
                    "/shane": "test/fixtures",
                    "/kittie": "test/fixtures"
                }
            },
            debugInfo: false,
            open: false
        };

        instance = browserSync.init(config, done);
    });

    after(function () {
        instance.cleanup();
    });

    it("serves files from the route with snippet added", function (done) {

        assert.isString(instance.options.snippet);

        request(instance.server)
            .get("/shane/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(_.contains(res.text, instance.options.snippet));
                done();
            });
    });

    it("serves files from the route with snippet added", function (done) {

        assert.isString(instance.options.snippet);

        request(instance.server)
            .get("/kittie/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(_.contains(res.text, instance.options.snippet));
                done();
            });
    });

    it("serves the client script", function (done) {

        request(instance.server)
            .get(instance.options.scriptPaths.versioned)
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(_.contains(res.text, "Connected to BrowserSync"));
                done();
            });
    });
});