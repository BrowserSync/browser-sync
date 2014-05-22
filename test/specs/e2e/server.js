"use strict";

var browserSync   = require("../../../lib/index");

var path    = require("path");

var sinon   = require("sinon");
var request = require("supertest");
var assert  = require("chai").assert;

var fixturesDir = path.resolve(__dirname + "/../../fixtures");

describe("E2E server test", function () {

    var options;
    var instance;
    var server;

    before(function (done) {

        var config = {
            server: {
                baseDir: fixturesDir
            },
            debugInfo: false
        };

        browserSync.init([], config, function (err, bs) {
            options  = bs.options;
            server   = bs.servers.staticServer;
            instance = bs;
            done();
        });
    });
    after(function () {
        server.close();
    });

    it("returns the snippet", function (done) {

        assert.isString(options.snippet);

        request(server)
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(res.text.indexOf("browser-sync-client") > 0);
                done();
            });
    });
    it("Can return the script", function (done) {

        request(server)
            .get(options.scriptPath)
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(res.text.indexOf("Connected to BrowserSync") > 0);
                done();
            });
    });
});
