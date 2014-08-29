"use strict";

var browserSync = require("../../../index");

var sinon   = require("sinon");
var request = require("supertest");
var assert  = require("chai").assert;

describe("E2E server test with only a callback", function () {

    var instance;
    var stub;

    before(function (done) {
        stub = sinon.stub(console, "log");
        instance = browserSync(done);
    });

    after(function () {
        instance.cleanup();
        stub.restore();
    });

    it("returns the script", function (done) {

        request(instance.server)
            .get(instance.options.scriptPaths.versioned)
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "Connected to BrowserSync");
                done();
            });
    });
});

describe("E2E server test with config & callback", function () {

    var instance;

    before(function (done) {

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            logLevel: "silent"
        };

        instance = browserSync(config, done);
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
