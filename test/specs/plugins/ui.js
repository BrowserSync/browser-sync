"use strict";

var browserSync = require("../../../");
var request     = require("supertest");
var Immutable   = require("immutable");
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

describe("Plugins: User interface - providing an override", function () {

    var instance;

    before(function (done) {

        browserSync.reset();

        var config = {
            logLevel: "silent",
            server: "test/fixtures",
            open: false
        };

        browserSync.use({
            "plugin:name": "UI",
            "plugin": function (opts, bs, cb) {
                opts = Immutable.fromJS(opts).mergeDeep(Immutable.fromJS({
                    urls: {
                        ui: "http://localhost:3001"
                    }
                }));
                cb(null, {
                    options: opts
                });
            }
        }, {port: 3333});

        instance = browserSync(config, done).instance;
    });
    after(function () {
        instance.cleanup();
    });
    it("Should use the user-provided plugin", function (done) {
        assert.deepEqual(instance.ui.options.get("port"), 3333);
        done();
    });
});
