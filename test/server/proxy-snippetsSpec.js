var bs = require("../../lib/browser-sync");
var browserSync = new bs();
var messages = require("../../lib/messages");
var http = require("http");
var filePath = require("path");
var connect = require("connect");
var sinon = require("sinon");
var proxy = require("../../lib/proxy");
var assert = require("chai").assert;

var ports = {
    socket: 3000,
    controlPanel: 3001,
    proxy: 3002
};

var expectedMatch1 = "<script src='//0.0.0.0:" + ports.socket + messages.socketIoScript + "'></script>";
var expectedMatch2 = "<script src='//0.0.0.0:" + ports.controlPanel + messages.clientScript() + "'></script>";

describe("Launching a proxy for connect server", function () {

    var app, server, proxyServer, proxyHost, reqCallback;

    before(function () {

        reqCallback = sinon.spy(function (req, res, next) {
            next();
        });

        app = connect().use(connect.static(filePath.resolve("test/fixtures")));
        server = http.createServer(app).listen(8001);
        proxyHost = "http://0.0.0.0:" + ports.proxy;

        var options = {
            proxy: {
                host: "0.0.0.0",
                port: 8001
            }
        };

        proxyServer = proxy.createProxy("0.0.0.0", ports, options, reqCallback);

    });

    after(function () {
        server.close();
        proxyServer.close();
    });

    it("can proxy requests + inject snippets into a small HTML response", function (done) {

        var data;

        http.get(proxyHost + "/index.html", function (res) {

            var chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk.toString());
            });
            res.on("end", function () {
                data = chunks.join("");
                console.log(data);
                assert.isTrue(data.indexOf(expectedMatch1) >= 0);
                assert.isTrue(data.indexOf(expectedMatch2) >= 0);
                done();
            });
        });
    });

    it("can proxy requests + inject snippets into a LARGE HTML response", function (done) {

        var data;
        http.get(proxyHost + "/index-large.html", function (res) {
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
});
