"use strict";

var browserSync   = require("../../../lib/index");

var sinon   = require("sinon");
var request = require("supertest");
var assert  = require("chai").assert;

describe("E2E Responding to file:changed event", function () {

    var options;
    var instance;
    var server;
    var watcher;

    before(function (done) {

        var config = {
            server: {
                baseDir: __dirname + "/../../fixtures"
            },
            files: ["test/fixtures/assets/*.css"],
            debugInfo: false,
            open: false
        };

        browserSync.init(config, function (err, bs) {
            options  = bs.options;
            server   = bs.servers.staticServer;
            watcher  = bs._watcher;
            instance = bs;

            done();
        });
    });

    after(function () {
        instance.cleanup();
    });

    it("returns the snippet", function (done) {

        instance.events.on("file:reload", function () {
            done();
        });

        instance.events.emit("file:changed", {path: "styles.css", log: true});
    });
});