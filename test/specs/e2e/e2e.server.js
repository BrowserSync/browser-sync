"use strict";

var browserSync = require("../../../lib/index");

var request = require("supertest");
var assert  = require("chai").assert;

describe("E2E server test", function () {

    var instance;

    before(function (done) {

        var config = {
            server: {
                baseDir: __dirname + "/../../fixtures"
            },
            debugInfo: false,
            open: false
        };

        instance = browserSync.init(config, done);
    });

    after(function () {
        instance.cleanup();
    });

    it("returns the snippet", function (done) {

        assert.isString(instance.options.snippet);

        request(instance.server)
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(res.text.indexOf("browser-sync-client") > -1);
                done();
            });
    });
    it("returns the script", function (done) {

        request(instance.server)
            .get(instance.options.scriptPath)
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(res.text.indexOf("Connected to BrowserSync") > 0);
                done();
            });
    });
});