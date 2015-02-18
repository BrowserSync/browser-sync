"use strict";

var browserSync   = require("../../../index");

var request = require("supertest");
var assert  = require("chai").assert;

describe("E2E snippet tests", function () {

    var instance;

    before(function (done) {

        browserSync.reset();

        var config = {
            logLevel: "silent"
        };

        instance = browserSync.init(config, done).instance;
    });

    after(function () {
        instance.cleanup();
    });

    it("returns the snippet URL", function (done) {

        request(instance.server)
            .get(instance.options.getIn(["scriptPaths", "versioned"]))
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "Connected to BrowserSync");
                done();
            });
    });
});

describe("E2E TLS snippet tests", function () {

    var instance;

    before(function (done) {

        browserSync.reset();

        var config = {
            logLevel: "silent",
            https: true
        };

        instance = browserSync.init(config, done).instance;
    });

    after(function () {
        instance.cleanup();
    });

    it("returns the snippet URL over HTTPS", function (done) {

        var options = instance.options.toJS();

        request(options.urls.local)
            .get(options.scriptPaths.versioned)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                assert.include(res.text, "Connected to BrowserSync");
                done();
            });
    });
});
