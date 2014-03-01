var server = require("../../lib/server");
var proxy = require("../../lib/proxy");
var defaultConfig = require("../../lib/default-config");
var path = require("path");
var http = require("http");
var fs = require("fs");
var assert = require("chai").assert;
var sinon = require("sinon");
var request = require("supertest");
var canNavigate = server.utils.canNavigate;

var ports = {
    socket: 3000,
    controlPanel: 3001,
    server: 3002
};

var options = { server: {} };

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
            var servers = server.launchServer("localhost", ports, options, io);

            request(servers.staticServer)
                .get("/index.html")
                .expect(200, done);
        });
        it("can serve an index.html, or index.htm from root", function (done) {

            options.server.baseDir = "test/fixtures/alt";
            options.server.index = "index.htm";

            var servers = server.launchServer("localhost", ports, options, io);

            request(servers.staticServer)
                .get("/")
                .expect(200, done);
        });

        it("can serve an index.html, or index.htm from root (2)", function (done) {

            options.server.baseDir = "test/fixtures";
            options.server.index = "index.html";
            var servers = server.launchServer("localhost", ports, options, io);

            request(servers.staticServer)
                .get("/")
                .expect(200, done);
        });
    });

    describe("launching the proxy", function () {

        var stub;
        var navCallbackStub;

        before(function () {
            stub = sinon.stub(proxy, "createProxy").returns(true);
            navCallbackStub = sinon.stub(server.utils, "navigateCallback").returns(true);
        });

        after(function () {
            stub.restore();
            navCallbackStub.restore();
        });

        it("can create the proxy", function () {
            var options = {
                proxy: true
            };
            var servers = server.launchServer("0.0.0.0", ports, options, io);
            sinon.assert.calledWithExactly(stub, "0.0.0.0", ports, options, true);
        });
    });
});
