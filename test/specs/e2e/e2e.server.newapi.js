"use strict";

var browserSync   = require("../../../index");

var sinon   = require("sinon");
var request = require("supertest");
var assert  = require("chai").assert;

describe("E2E server test with only a callback", function () {

    var instance;
    var stub;

    before(function (done) {
        stub = sinon.spy(console, "log");
        instance = browserSync(done);
    });

    after(function () {
        instance.cleanup();
        console.log.restore();
    });

    it("Can return the script", function (done) {

        request(instance.server)
            .get(instance.options.scriptPaths.versioned)
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "Connected to BrowserSync");
                done();
            });
    });
});

describe("E2E server test with only a config option", function () {

    var instance;

    before(function (done) {

        var called;

        instance = browserSync({
            open: false,
            debugInfo: false,
            server: {
                baseDir: "test/fixtures"
            }
        });

        instance.events.on("init", function () {
            if (!called) {
                done();
                called = true;
            }
        });
    });

    after(function () {
        instance.cleanup();
    });

    it("Can return the script", function (done) {

        request(instance.server)
            .get(instance.options.scriptPaths.versioned)
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "Connected to BrowserSync");
                done();
            });
    });
});
