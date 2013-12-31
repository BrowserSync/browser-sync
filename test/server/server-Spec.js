var bs = require("../../lib/browser-sync");
var server = require("../../lib/server");
var proxy = require("../../lib/proxy");
var path = require("path");
var browserSync = new bs();
var messages = require("../../lib/messages");
var http = require("http");
var fs = require("fs");
var assert = require("chai").assert;
var sinon = require("sinon");

var ports = [3000, 3001, 3002];
var host  = "0.0.0.0";

describe("Server Module", function () {
    it("should have the launchServer method", function () {
        assert.isFunction(server.launchServer);
    });
});

describe("Modify Snippet", function () {

    var readFile;
    var socketConnector;

    before(function () {
        socketConnector = sinon.spy(messages, "socketConnector");
        readFile = sinon.stub(fs, "readFileSync");
    });
    afterEach(function () {
        socketConnector.reset();
        readFile.reset();
    });
    after(function () {
        readFile.restore();
    });
    it("should be a function", function () {
        assert.isFunction(server.utils.modifySnippet);
    });
    it("should return  a function", function () {
        var actual = server.utils.modifySnippet(host, ports[0]);
        assert.isFunction(actual);
    });
    it("should call messages.socketConnector", function () {
        server.utils.modifySnippet(host, ports[0]);
        sinon.assert.calledWithExactly(socketConnector, host, ports[0]);
    });
    it("should read the client JS file", function () {
        server.utils.modifySnippet(host, ports[0]);
        var arg = readFile.getCall(0).args[0];
        var actual = arg.indexOf(messages.clientScript());
        assert.isTrue(actual > 0);
    });
    it("should read the client JS SHIMS file", function () {
        server.utils.modifySnippet(host, ports[0]);
        var arg = readFile.getCall(1).args[0];
        var actual = arg.indexOf(messages.client.shims);
        assert.isTrue(actual > 0);
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

    describe("serving the client-side JS", function () {

        var clientScriptUrl;
        var expected;
        var servers;

        before(function () {

            var options = {
                server: {
                    baseDir: "test/fixtures"
                }
            };
            clientScriptUrl = "http://localhost:" + ports[1] + messages.clientScript();
            expected =  messages.socketConnector("localhost", ports[0]);
            servers = server.launchServer("localhost", ports, options, io);
        });
        after(function () {
            servers.staticServer.close();
        });

        it("can serve the JS file", function (done) {
            http.get(clientScriptUrl, function (res) {
                assert.equal(res.statusCode, 200);
                done();
            });
        });
        it("can append the code needed to connect to socketIO", function (done) {
            http.get(clientScriptUrl, function (res) {
                res.on("data", function (chunk) {
                    var respString = chunk.toString();
                    var actual = respString.indexOf(expected);
                    assert.isTrue(actual > 0);
                    done();
                });
            });
        });
        it("can append the shims", function (done) {
            http.get(clientScriptUrl, function (res) {
                res.on("data", function (chunk) {
                    var respString = chunk.toString();
                    var actual = respString.indexOf("browser-sync shims");
                    assert.isTrue(actual > 0);
                    done();
                });
            });
        });
    });

    describe("server for Static Files", function () {

        it("can serve files", function (done) {
            var options = {
                server: {
                    baseDir: "test/fixtures"
                }
            };
            var servers = server.launchServer("localhost", ports, options, io);

            http.get("http://localhost:" + ports[1] + "/index.html", function (res) {
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

            http.get("http://localhost:" + ports[1], function (res) {
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

            http.get("http://localhost:" + ports[1], function (res) {
                var actual = res.statusCode;
                assert.equal(actual, 200);
                servers.staticServer.close();
                done();
            });
        });

        it("does not serve static files if server:false", function (done) {
            var options = {
                server: false
            };
            var servers = server.launchServer("localhost", ports, options, io);

            http.get("http://0.0.0.0:" + ports[1], function (res) {
                var actual = res.statusCode;
                assert.equal(actual, 404);
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
            servers.staticServer.close();
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
        it.only("should call sockets.clients() if the req url is not in excluded list", function () {
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
        it("should NOT call sockets.clients() if the req.mehtod is POST", function () {
            func({url: "/", method: "POST"}, {}, next);
            sinon.assert.notCalled(clientsSpy);
        });
        it("should NOT call sockets.clients() if the req.mehtod is PUT", function () {
            func({url: "/", method: "PUT"}, {}, next);
            sinon.assert.notCalled(clientsSpy);
        });
        it("should NOT call sockets.clients() if the req.mehtod is DELETE", function () {
            func({url: "/", method: "DELETE"}, {}, next);
            sinon.assert.notCalled(clientsSpy);
        });
        it("should NOT call sockets.clients() if the req.mehtod is PATCH", function () {
            func({url: "/", method: "PATCH"}, {}, next);
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

            http.get("http://localhost:" + ports[1] + "/index.html", function (res) {
                sinon.assert.called(clientsSpy);
                servers.staticServer.close();
                done();
            });
        });
    });
    describe("the navigateCallback function (ghostmode links OFF)", function () {

        var func;
        var next;
        var options;

        before(function () {
            options = {
                ghostMode: {
                    links:false
                }
            };
            func = server.utils.navigateCallback(io, options);
            next = sinon.spy();
        });
        it("should NOT call sockets.clients() if links disabled in config", function () {
            func({url: "/"}, {}, next);
            sinon.assert.notCalled(clientsSpy);
        });
    });
});
