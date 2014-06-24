"use strict";

var browserSync = require("../../../lib/index");

var sinon   = require("sinon");
var request = require("supertest");
var assert  = require("chai").assert;

describe("E2E server test with only a callback", function () {

    var options;
    var instance;
    var server;

    before(function (done) {

        browserSync(function (err, bs) {

            options  = bs.options;
            server   = bs.servers.staticServer;
            instance = bs;

            done();
        });
    });

    after(function () {
        server.close();
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

describe("E2E server test with only a callback", function () {

    var options;
    var instance;
    var server;

    before(function (done) {

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            open: false,
            logLevel: "silent"
        };

        browserSync(config, function (err, bs) {

            options  = bs.options;
            server   = bs.servers.staticServer;
            instance = bs;

            done();
        });
    });

    after(function () {
        server.close();
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