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
var snippet = messages.scriptTags(host, ports, {}, "controlPanel");

describe("Launching the Control panel", function () {

    var controlPanelServer;
    var options, clientScriptSpy;

    before(function () {
        options = {
            devMode: false
        };
        clientScriptSpy = sinon.spy(messages, "clientScript");
        controlPanelServer = controlPanel.launchControlPanel("0.0.0.0", ports, options);
    });

    afterEach(function () {
        clientScriptSpy.restore();
    });
    after(function () {
        controlPanelServer.close();
    });

    it("should call clientScript with options", function () {
        sinon.assert.calledWithExactly(clientScriptSpy, options);
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
            var chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk.toString());
            });
            res.on("end", function () {
                data = chunks.join("");
                assert.isTrue(data.indexOf(snippet) >= 0);
                done();
            });
        });
    });
});

describe("Modify Snippet", function () {

    var readFile;
    var socketConnector;
    var clientScript;

    before(function () {
        clientScript = messages.clientScript();
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
    it("should read the client JS file", function () {
        controlPanel.utils.modifySnippet(host, ports[0], {}, clientScript);
        var arg = readFile.getCall(0).args[0];
        var actual = arg.indexOf(messages.clientScript());
        assert.isTrue(actual > 0);
    });
    it("should read the client JS SHIMS file", function () {
        controlPanel.utils.modifySnippet(host, ports[0], {}, clientScript);
        var arg = readFile.getCall(1).args[0];
        var actual = arg.indexOf(messages.client.shims);
        assert.isTrue(actual > 0);
    });
});
