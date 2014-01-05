var bs = require("../../../lib/browser-sync");
var server = require("../../../lib/server");
var controlPanel = require("../../../lib/control-panel");
var proxy = require("../../../lib/proxy");
var path = require("path");
var browserSync = new bs();
var messages = require("../../../lib/messages");
var http = require("http");
var fs = require("fs");
var assert = require("chai").assert;
var sinon = require("sinon");

var ports = {
    socket: 3000,
    controlPanel: 3001,
    server: 3002
};
var host  = "0.0.0.0";

var cpHost   = "http://0.0.0.0:3001";
var clientScriptUrl = "http://0.0.0.0:" + ports.controlPanel + messages.clientScript();

var expectedMatch1 = "<script src='//0.0.0.0:" + ports.socket + messages.socketIoScript + "'></script>";
var expectedMatch2 = "<script src='//0.0.0.0:" + ports.controlPanel + messages.controlPanel.jsFile + "'></script>";

describe("Launching the Control panel", function () {

    var controlPanelServer;
    var io;

    before(function () {
        io = {};
        controlPanelServer = controlPanel.launchControlPanel("0.0.0.0", ports, {});
    });

    after(function () {
        controlPanelServer.close();
    });

    it("should launch and be accessible via http", function (done) {
        var statusCode;

        http.get(cpHost + "/index.html", function (res) {
            var actual = res.statusCode;
            assert.equal(actual, 200);
            done();
        });
    });

    it("should launch and be able to access the control panel JS", function (done) {
        http.get(cpHost + "/js/app.js", function (res) {
            var actual = res.statusCode;
            assert.equal(actual, 200);
            done();
        });
    });

    it("should launch and be able to access angular.min.js", function (done) {
        http.get(cpHost + "/js/angular.min.js", function (res) {
            var actual = res.statusCode;
            assert.equal(actual, 200);
            done();
        });
    });

    it("can serve the Client JS file", function (done) {
        http.get(clientScriptUrl, function (res) {
            assert.equal(res.statusCode, 200);
            done();
        });
    });
    it("can append the code needed to connect to socketIO", function (done) {
        http.get(clientScriptUrl, function (res) {
            res.on("data", function (chunk) {
                var respString = chunk.toString();
                var actual = respString.indexOf("var ___socket___ = io.connect('http://0.0.0.0:3000');");
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
    it("should have the snippets for socket.io + App.js attached", function (done) {
        var data;
        http.get(cpHost, function (res) {
            res.setEncoding('utf8');
            var chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk.toString());
            });
            res.on("end", function () {
                data = chunks.join("");
                assert.isTrue(data.indexOf(expectedMatch1) >= 0);
                assert.isTrue(data.indexOf(expectedMatch2) >= 0);
                done();
            });
        });
    });
//    it("can append the code needed to connect to socketIO to APP.js", function (done) {
//
//        var expectedString = "var ___socket___ = io.connect('http://0.0.0.0:" + ports.socket + "');";
//        var respString;
//        http.get("http://0.0.0.0:3001/js/app.js", function (res) {
//            res.on("data", function (chunk) {
//                respString = chunk.toString();
//                assert.equal(respString.indexOf(expectedString) >= 0, true);
//                done();
//            });
//        });
//    });

//    it("can append the code needed to connect to socketIO to browser-sync-client", function () {
//
//        var expectedString = "var ___socket___ = io.connect('http://0.0.0.0:" + ports[0] + "');";
//
//        var respString;
//
//        http.get("http://0.0.0.0:3003/browser-sync-client.min.js", function (res) {
//
//            res.on("data", function (chunk) {
//                respString = chunk.toString();
//            });
//        });
//
//        waitsFor(function () {
//            return respString;
//        }, "Took too long", 1000);
//
//        runs(function () {
//            expect(respString.indexOf(expectedString)).toBe(0);
//        });
//    });
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
        assert.isFunction(controlPanel.utils.modifySnippet);
    });
    it("should return a function", function () {
        var actual = controlPanel.utils.modifySnippet(host, ports[0]);
        assert.isFunction(actual);
    });
    it("should call messages.socketConnector", function () {
        controlPanel.utils.modifySnippet(host, ports[0]);
        sinon.assert.calledWithExactly(socketConnector, host, ports[0]);
    });
    it("should read the client JS file", function () {
        controlPanel.utils.modifySnippet(host, ports[0]);
        var arg = readFile.getCall(0).args[0];
        var actual = arg.indexOf(messages.clientScript());
        assert.isTrue(actual > 0);
    });
    it("should read the client JS SHIMS file", function () {
        controlPanel.utils.modifySnippet(host, ports[0]);
        var arg = readFile.getCall(1).args[0];
        var actual = arg.indexOf(messages.client.shims);
        assert.isTrue(actual > 0);
    });
});
