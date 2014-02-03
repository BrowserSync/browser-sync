var bs = require("../../lib/browser-sync");
var server = require("../../lib/server");
var proxy = require("../../lib/proxy");
var index = require("../../lib/index");
var defaultConfig = index.defaultConfig;
var path = require("path");
var browserSync = new bs();
var messages = require("../../lib/messages");
var http = require("http");
var fs = require("fs");
var assert = require("chai").assert;
var sinon = require("sinon");
var canNavigate = server.utils.canNavigate;

var ports = {
    socket: 3000,
    controlPanel: 3001,
    server: 3002
};

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

        var serverUrl = "http://localhost:" + ports.server;

        it("can serve files", function (done) {
            var options = {
                server: {
                    baseDir: "test/fixtures"
                }
            };
            var servers = server.launchServer("localhost", ports, options, io);

            http.get(serverUrl + "/index.html", function (res) {
                var actual = res.statusCode;
                assert.equal(actual, 200);
                servers.staticServer.close();
                done();
            });
        });
        it("can serve an index.html, or index.htm from root", function (done) {
            var options = {
                server: {
                    baseDir: "test/fixtures/alt",
                    index: "index.htm"
                }
            };

            var servers = server.launchServer("localhost", ports, options, io);

            http.get(serverUrl, function (res) {
                var actual = res.statusCode;
                assert.equal(actual, 200);
                servers.staticServer.close();
                done();
            });
        });

        it("can serve an index.html, or index.htm from root (2)", function (done) {
            var options = {
                server: {
                    baseDir: "test/fixtures"
                }
            };

            var servers = server.launchServer("localhost", ports, options, io);

            http.get(serverUrl, function (res) {
                var actual = res.statusCode;
                assert.equal(actual, 200);
                servers.staticServer.close();
                done();
            });
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

    describe("the navigateCallback function (ghostmode links ON)", function () {

        var func;
        var next;
        var options;

        before(function () {
            options = {
                ghostMode: {
                    links: true
                }
            };
            func = server.utils.navigateCallback(io, options);
            next = sinon.spy();
        });

        it("should return a function to be used as middleware", function () {
            assert.isFunction(func);
        });
        it("should return a function to be that has three params", function () {
            assert.equal(func.length, 3);
        });
        it("should call sockets.clients() if the req url is not in excluded list", function () {
            func({url: "/", method:"GET"}, {}, next);
            sinon.assert.called(clientsSpy);
        });
        it("should call sockets.clients() if the req url is not in excluded list (2)", function () {
            func({url: "/index.html", method:"GET"}, {method:"GET"}, next);
            sinon.assert.called(clientsSpy);
        });
        it("should NOT call sockets.clients() if the req url IS in excluded list (1)", function () {
            func({url: "/core.css"}, {}, next);
            sinon.assert.notCalled(clientsSpy);
        });
        it("should NOT call sockets.clients() if the req url IS in excluded list (2)", function () {
            func({url: "/font.woff"}, {}, next);
            sinon.assert.notCalled(clientsSpy);
        });
        it("E2E", function (done) {
            var options = {
                ghostMode: {
                    links: true
                },
                server: {
                    baseDir: "test/fixtures"
                }
            };
            var servers = server.launchServer("localhost", ports, options, io);

            http.get("http://localhost:" + ports.server + "/index.html", function (res) {
                sinon.assert.called(clientsSpy);
                servers.staticServer.close();
                done();
            });
        });
    });
    describe("the canNavigate function Check", function () {

        var options = {
            ghostMode: {
                links: true
            },
            excludedFileTypes: defaultConfig.excludedFileTypes
        };

        describe("rejecting/accepting requests", function () {
            var req;
            beforeEach(function () {
                req = {
                    method: "GET",
                    url: "/upload",
                    headers: {}
                };
            });
            it("should return false for files in excluded list", function () {
                req.url = "/core.css";
                var actual = canNavigate(req, options);
                assert.isFalse(actual);
            });
            it("should return false for POST requests", function () {
                req.method = "POST";
                var actual = canNavigate(req, options);
                assert.isFalse(actual);
            });
            it("should return false for PUT requests", function () {
                req.method = "PUT";
                var actual = canNavigate(req, options);
                assert.isFalse(actual);
            });
            it("should return false for PATCH requests", function () {
                req.method = "PATCH";
                var actual = canNavigate(req, options);
                assert.isFalse(actual);
            });
            it("should return false for DELETE requests", function () {
                req.method = "DELETE";
                var actual = canNavigate(req, options);
                assert.isFalse(actual);
            });
            it("should return true when url is NOT iun exluded list", function () {
                req.url = "/app";
                var actual = canNavigate(req, options);
                assert.isTrue(actual);
            });
            it("should return TRYE when url is NOT in exluded list", function () {
                req.url = "/";
                var actual = canNavigate(req, options);
                assert.isTrue(actual);
            });
            it("should return FALSE when ghostMode Links disabled", function () {
                options.ghostMode.links = false;
                var actual = canNavigate(req, options);
                assert.isFalse(actual);
            });
            it("should return false for AJAX requests", function () {
                req.headers["x-requested-with"] = "XMLHttpRequest";
                var actual = canNavigate(req, options);
                assert.isFalse(actual);
            });
        });
    });
});
