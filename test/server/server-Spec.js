var bs = require("../../lib/browser-sync");
var server = require("../../lib/server");
var proxy = require("../../lib/proxy");
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
        sinon.assert.calledWith(socketConnector, host, ports[0]);
    });
    it("should get the JS file", function () {
        server.utils.modifySnippet(host, ports[0]);
        sinon.assert.called(readFile);
    });
});

describe("serving the client-side JS", function () {

    var clientScriptUrl = "http://localhost:" + ports[1] + messages.clientScript;

    it("can serve the JS file", function (done) {

        var options = {
            server: {
                baseDir: "test/fixtures"
            }
        };

        var servers = server.launchServer("localhost", ports, options);

        http.get(clientScriptUrl, function (res) {
            assert.equal(res.statusCode, 200);
            servers.staticServer.close();
            done();
        });
    });
    it("can append the code needed to connect to socketIO", function (done) {
        var expectedString = "var ___socket___ = io.connect('http://localhost:" + ports[0] + "');";

        var options = {
            server: {
                baseDir: "test/fixtures"
            }
        };

        var servers = server.launchServer("localhost", ports, options);

        http.get(clientScriptUrl, function (res) {

            res.on("data", function (chunk) {
                var respString = chunk.toString();
                var actual = respString.indexOf(expectedString);
                assert.equal(actual, 0);
                servers.staticServer.close();
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
        var servers = server.launchServer("localhost", ports, options);

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

        var servers = server.launchServer("localhost", ports, options);

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

        var servers = server.launchServer("localhost", ports, options);

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
        var servers = server.launchServer("localhost", ports, options);

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

    before(function () {
        stub = sinon.stub(proxy, "createProxy").returns(true);
    });

    after(function () {
        stub.restore();
    });

    it("can create the proxy", function () {
        var options = {
            proxy: true
        };
        var servers = server.launchServer("0.0.0.0", ports, options);
        servers.staticServer.close();
        sinon.assert.calledWith(stub, "0.0.0.0", ports, options);
    });
});

