"use strict";

var browserSync = require("../../../index");
var request     = require("supertest");
var assert      = require("chai").assert;

describe("Plugins: User interface", function () {

    var instance;

    before(function (done) {

        browserSync.reset();

        var config = {
            logLevel: "silent",
            server: "test/fixtures",
            open: false
        };

        instance = browserSync(config, done).instance;
    });
    after(function () {
        instance.cleanup();
    });
    it("Should start the UI", function (done) {
        request(instance.ui.server)
            .get("/")
            .expect(200)
            .end(done);
    });
});

describe("Plugins: User interface", function () {

    var instance;

    before(function (done) {

        browserSync.reset();

        var config = {
            logLevel: "silent",
            server: "test/fixtures",
            open: false,
            ui: false
        };

        instance = browserSync(config, done).instance;
    });
    after(function () {
        instance.cleanup();
    });
    it("Should ignore the UI if false given in options", function (done) {
        assert.isUndefined(instance.ui);
        assert.isFalse(instance.options.get("ui"));
        done();
    });
});
