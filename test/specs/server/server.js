"use strict";

var defaultConfig = require("../../../lib/default-config");
var server        = require("../../../lib/server");
var proxy         = require("../../../lib/proxy");

var assert  = require("chai").assert;
var sinon   = require("sinon");
var request = require("supertest");

var ports = {
    socket: 3000,
    controlPanel: 3001,
    server: 3002
};

var options = { server: {}, version: "0.0.1" };

describe("Server Module", function () {
    it("should have the launchServer method", function () {
        assert.isFunction(server.launchServer);
    });
});

describe("", function () {

    var io;
    var clientsSpy;
    var emitSpy;

    before(function () {
        clientsSpy = sinon.stub().returns([]);
        emitSpy = sinon.spy();
        io = {
            sockets: {
                clients: clientsSpy,
                emit: emitSpy
            }
        };
    });
    afterEach(function () {
        clientsSpy.reset();
        emitSpy.reset();
    });

    describe("server for Static Files", function () {

        it("can serve files", function (done) {
            options.server.baseDir = "test/fixtures";
            var servers = server.launchServer("localhost", 3000, options, "SCRIPT");

            request(servers.staticServer)
                .get("/index.html")
                .expect(200, done);
        });
        it("can serve an index.html, or index.htm from root", function (done) {

            options.server.baseDir = "test/fixtures/alt";
            options.server.index = "index.htm";

            var servers = server.launchServer("localhost", 3000, options, io);

            request(servers.staticServer)
                .get("/")
                .expect(200, done);
        });

        it("can serve an index.html, or index.htm from root (2)", function (done) {

            options.server.baseDir = "test/fixtures";
            options.server.index = "index.html";
            var servers = server.launchServer("localhost", 3000, options, io);

            request(servers.staticServer)
                .get("/")
                .expect(200, done);
        });

        it("can serve files from multiple dirs", function (done) {

            options.server.baseDir = ["test/fixtures", "test/fixtures2"];
            options.server.index = "index.html";
            var servers = server.launchServer("localhost", 3000, options, io);

            request(servers.staticServer)
                .get("/style-alt.css")
                .expect(200, done);
        });
    });
});
