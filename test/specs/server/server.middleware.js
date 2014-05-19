"use strict";

var defaultConfig = require("../../../lib/default-config");
var server        = require("../../../lib/server");

var assert  = require("chai").assert;
var sinon   = require("sinon");
var request = require("supertest");

var options = { server: {}, version: "2.1.0" };

describe("Adding custom middleware", function () {

    it("can add a single middleware given as function", function (done) {

        var spy = sinon.spy(function (req, res, next) {
            next();
        });

        options.server.baseDir = "test/fixtures";
        options.server.middleware = spy;

        var servers = server.launchServer("localhost", 3000, options, {});

        request(servers.staticServer)
            .get("/index.html")
            .expect(200)
            .end(function () {
                sinon.assert.called(spy);
                done();
            });
    });
    it("can add multiple middleware given as array", function (done) {

        var spy = sinon.spy(function (req, res, next) {
            next();
        });
        var spy2 = sinon.spy(function (req, res, next) {
            next();
        });

        options.server.baseDir = "test/fixtures";
        options.server.middleware = [spy, spy2];

        var servers = server.launchServer("localhost", 3000, options, {});

        request(servers.staticServer)
            .get("/index.html")
            .expect(200)
            .end(function () {
                sinon.assert.called(spy);
                sinon.assert.called(spy2);
                done();
            });
    });
});