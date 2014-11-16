"use strict";

var server        = require("../../../lib/server/");
var defaultConfig = require("../../../lib/default-config");

var assert  = require("chai").assert;
var sinon   = require("sinon");
var request = require("supertest");

describe("Server: module", function () {

    it("should have the createServer method", function () {
        assert.isFunction(server.createServer);
    });
});

describe("Server: The createServer method", function () {

    var io;
    var clientsSpy;
    var emitSpy;
    var options;

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
    beforeEach(function () {
        options = {
            server: {},
            port: 3000,
            version: "0.0.1",
            host: "localhost",
            snippetOptions: defaultConfig.snippetOptions
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

        it("can serve an index.htm from multiple dirs", function (done) {

            options.server.baseDir = ["test/fixtures2", "test/fixtures/alt"];
            options.server.index = "index.htm";

            var bsServer = server.createServer(options, io, {});

            request(bsServer)
                .get("/")
                .expect(200, done);
        });

        it("can show a directory listing", function (done) {

            options.server.baseDir   = "test/fixtures";
            options.server.directory = true;

            var bsServer = server.createServer(options, io, {});

            request(bsServer)
                .get("/")
                .expect(200)
                .set("accept", "text/html")
                .end(function (err, res) {
                    assert.include(res.text, "<title>listing directory /</title>");
                    done();
                });
        });
        it("can show a directory listing", function (done) {

            options.server.baseDir   = "test/fixtures";
            options.server.directory = true;

            var bsServer = server.createServer(options, io, {});

            request(bsServer)
                .get("/")
                .expect(200)
                .set("accept", "text/html")
                .end(function (err, res) {
                    assert.include(res.text, "<title>listing directory /</title>");
                    done();
                });
        });
    });
});
