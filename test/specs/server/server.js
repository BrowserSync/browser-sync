"use strict";

var server        = require("../../../lib/server/");

var assert  = require("chai").assert;
var sinon   = require("sinon");
var request = require("supertest");

var options = {
    server: {},
    port: 3000,
    version: "0.0.1",
    host: "localhost"
};

describe("Server: module", function () {

    it("should have the createServer method", function () {
        assert.isFunction(server.createServer);
    });
});

describe("Server: The createServer method", function () {

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

    describe("Used for Static Files", function () {

        it("can serve files", function (done) {

            options.server.baseDir = "test/fixtures";

            var bsServer = server.createServer(options, "SCRIPT", {});

            request(bsServer)
                .get("/index.html")
                .expect(200, done);
        });
        it("can serve an index.html, or index.htm from root", function (done) {

            options.server.baseDir = "test/fixtures/alt";
            options.server.index = "index.htm";

            var bsServer = server.createServer(options, "SCRIPT", {});

            request(bsServer)
                .get("/")
                .expect(200, done);
        });

        it("can serve an index.html, or index.htm from root (2)", function (done) {

            options.server.baseDir = "test/fixtures";
            options.server.index = "index.html";

            var bsServer = server.createServer(options, io, {});

            request(bsServer)
                .get("/")
                .expect(200, done);
        });

        it("can serve files from multiple dirs", function (done) {

            options.server.baseDir = ["test/fixtures", "test/fixtures2"];
            options.server.index = "index.html";

            var bsServer = server.createServer(options, io, {});

            request(bsServer)
                .get("/style-alt.css")
                .expect(200, done);
        });
    });
});
