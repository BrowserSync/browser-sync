var bs = require("../../lib/browser-sync");
var browserSync = new bs();
var messages = require("../../lib/messages");
var http = require("http");
var filePath = require("path");
var connect = require("connect");
var createProxy = require("../../lib/dev-proxy");
var assert = require("chai").assert;

var ports = [3000, 3001, 3002];
var proxyHost = "http://0.0.0.0:" + ports[2];

var expectedMatch1 = "<script src='http://0.0.0.0:" + ports[0] + messages.socketIoScript + "'></script>";
var expectedMatch2 = "<script src='http://0.0.0.0:" + ports[1] + messages.clientScript + "'></script>";

describe("Launching a proxy for connect server", function () {

    var app, server, proxyServer;

    before(function () {

        app = connect().use(connect.static(filePath.resolve("test/fixtures")));
        server = http.createServer(app).listen(8000);

        var options = {
            proxy: {
                host: "0.0.0.0",
                port: 8000
            }
        };

        proxyServer = createProxy("0.0.0.0", ports, options);

    });

    after(function () {
        server.close();
        proxyServer.close();
    });


    it("can proxy requests for html files", function (done) {
        http.get(proxyHost + "/index.html", function (res) {
            var actual = res.statusCode;
            assert.equal(actual, 200);
            done();
        });
    });
    it("can proxy requests for html files (2)", function (done) {
        http.get(proxyHost + "/index-large.html", function (res) {
            var actual = res.statusCode;
            assert.equal(actual, 200);
            done();
        });
    });
});

/**
 *
 *
 * Testing proxy with external IP based server such as "192.116.2.5:8001"
 *
 *
 */
//describe("Launching a proxy for external PHP server", function () {
//
//    var proxyServer;
//
//    before(function () {
//
//        // Server we are proxying ( fixtures DIR );
//        var options = {
//            proxy: {
//                host: "0.0.0.0",
//                port: 8001
//            }
//        };
//
//        proxyServer = createProxy("0.0.0.0", ports, options);
//
//    });
//
//    after(function () {
//        proxyServer.close();
//    });
//
//    it("can proxy requests", function (done) {
//
//        http.get(proxyHost, function (res) {
//            var actual = res.statusCode;
//            assert.equal(actual, 200);
//            done();
//        });
//    });
//    it("can proxy requests + inject snippets", function (done) {
//
//        var data;
//
//        http.get("http://0.0.0.0:" + ports[2], function (res) {
//            var chunks = [];
//            res.on("data", function (chunk) {
//                chunks.push(chunk.toString());
//            });
//            res.on("end", function () {
//                data = chunks.join("");
//                assert.isTrue(data.indexOf(expectedMatch1) >= 0);
//                assert.isTrue(data.indexOf(expectedMatch2) >= 0);
//                done();
//            });
//        });
//    });
//});
//
///**
// *
// *
// * Testing proxy with external VHOST + port server such as "local.dev:8888"
// *
// *
// */
//describe("Launching a proxy for external PHP server", function () {
//
//    var proxyServer;
//
//    before(function () {
//        var options = {
//            proxy: {
//                host: "firecrest.dev",
//                port: 8888
//            }
//        };
//        proxyServer = createProxy("0.0.0.0", ports, options);
//    });
//
//    after(function () {
//        proxyServer.close();
//    });
//
//    it("can proxy requests", function (done) {
//        http.get(proxyHost, function (res) {
//            var actual = res.statusCode;
//            assert.equal(actual, 200);
//            done();
//        });
//    });
//    it("can proxy requests + inject snippets", function (done) {
//        http.get("http://0.0.0.0:" + ports[2], function (res) {
//            var data;
//            var chunks = [];
//            res.on("data", function (chunk) {
//                chunks.push(chunk.toString());
//            });
//            res.on("end", function () {
//                data = chunks.join("");
//                assert.isTrue(data.indexOf(expectedMatch1) >= 0);
//                assert.isTrue(data.indexOf(expectedMatch2) >= 0);
//                done();
//            });
//        });
//    });
//});