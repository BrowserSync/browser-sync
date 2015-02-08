"use strict";

var browserSync = require("../../../");

var assert = require("chai").assert;
var request = require("supertest");

describe("E2E script path test - given a callback", function () {

    var instance;

    before(function (done) {
        browserSync.reset();

        var config = {
            server:     {
                baseDir: "test/fixtures"
            },
            open:       false,
            scriptPath: function (scriptPath) {
                return "localhost:PORT" + scriptPath;
            }
        };
        instance = browserSync(config, done).instance;
    });

    after(function () {
        instance.cleanup();
    });

    it("Sets the script path", function () {
        assert.include(instance.options.get("snippet"), "localhost:PORT/browser-sync/browser-sync-client.");
    });
});

describe("E2E Socket path test - given a callback", function () {

    var instance;

    before(function (done) {
        browserSync.reset();
        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open:   false,
            socket: {
                namespace: function () {
                    return "/TEST";
                }
            }
        };
        instance = browserSync(config, done).instance;
    });

    after(function () {
        instance.cleanup();
    });

    it("sets the socket path", function (done) {
        request(instance.server)
            .get(instance.options.getIn(["scriptPaths", "path"]))
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "io('/TEST'");
                done();
            });
    });
});

describe("E2E Socket path test - given a callback", function () {

    var instance;

    before(function (done) {
        browserSync.reset();

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open:   false,
            socket: {
                namespace: function (namespace) {
                    return "https://localhost:9000" + namespace;
                }
            }
        };
        instance = browserSync(config, done).instance;
    });

    after(function () {
        instance.cleanup();
    });

    it("sets the socket path", function (done) {
        request(instance.server)
            .get(instance.options.getIn(["scriptPaths", "path"]))
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "___browserSync___.io('https://localhost:9000/browser-sync',");
                done();
            });
    });
});
