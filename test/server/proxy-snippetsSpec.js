var bs = require("../../lib/browser-sync");
var browserSync = new bs();
var messages = require("../../lib/messages");
var http = require("http");
var filePath = require("path");
var connect = require("connect");
var sinon = require("sinon");
var proxy = require("../../lib/proxy");
var assert = require("chai").assert;

var ports = [3000, 3001, 3002];

var expectedMatch1 = "<script src='//0.0.0.0:" + ports[0] + messages.socketIoScript + "'></script>";
var expectedMatch2 = "<script src='//0.0.0.0:" + ports[1] + messages.clientScript() + "'></script>";

describe("Launching a proxy for connect server", function () {

    var app, server, proxyServer, proxyHost, reqCallback;

    before(function () {

        reqCallback = sinon.spy(function (req, res, next) {
            next();
        });

        app = connect().use(connect.static(filePath.resolve("test/fixtures")));
        server = http.createServer(app).listen(8001);
        proxyHost = "http://0.0.0.0:" + ports[2];

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


    /**
     *
     *
     * SUPPORT FOR AMD LOADERS
     * The script has to be appended *before* the script tag, therefor we insert it
     * as first tag in the body
     *
     *
     */
    it.skip("can prepend script tags before any existing script tag", function (done) {
        http.get(proxyHost + "/index-with-scripts.html", function (res) {
            var chunks = [];
            var data;
            res.on("data", function (chunk) {
                chunks.push(chunk.toString());
            });
            res.on("end", function () {
                data = chunks.join("");

                // TODO: assertions
                
                done();
            });
        });
    });
});
