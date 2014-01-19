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
var options = {};
var snippet = messages.scriptTags("0.0.0.0", ports, options);
var proxyHost = "http://0.0.0.0:" + ports.proxy;

describe("Launching a proxy for connect server", function () {

    var app, server, proxyServer, reqCallback;

    before(function () {

        reqCallback = sinon.spy(function (req, res, next) {
            next();
        });

        app = connect().use(function (req, res, next) {
            res.setHeader("content-encoding", "gzip");
            res.setHeader("content-length", "1024");
            next();
        }).use(connect.static(filePath.resolve("test/fixtures")));

        server = http.createServer(app).listen(8001);

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
    it("can re-write the URLS", function (done) {
        var data;
        http.get(proxyHost + "/index-urls.html", function (res) {
            var chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk.toString());
            });
            res.on("end", function () {
                data = chunks.join("");
                assert.deepEqual(~data.indexOf("0.0.0.0:8001"), 0);
                done();
            });
        });
    });
    it("can remove content-encoding headers", function (done) {
        http.get(proxyHost + "/proxy-headers.html", function (res) {
            var actual = res.headers.hasOwnProperty("content-encoding");
            assert.isFalse(actual);
            done();
        });
    });
    it("can remove content-encoding headers", function (done) {
        http.get(proxyHost + "/proxy-headers.html", function (res) {
            var actual = res.headers.hasOwnProperty("content-length");
            assert.isFalse(actual);
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
//    var proxyServer, reqCallback;
//
//    before(function () {
//
//        reqCallback = sinon.spy(function (req, res, next) {
//            next();
//        });
//
//        // Server we are proxying;
//        var options = {
//            proxy: {
//                host: "0.0.0.0",
//                port: 8000
//            }
//        };
//
//        proxyServer = proxy.createProxy("0.0.0.0", ports, options, reqCallback);
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
//        http.get(proxyHost, function (res) {
//            var chunks = [];
//            res.on("data", function (chunk) {
//                chunks.push(chunk.toString());
//            });
//            res.on("end", function () {
//                data = chunks.join("");
//                assert.isTrue(data.indexOf(snippet) >= 0);
//                done();
//            });
//        });
//    });
//    it("can re-write the URLS", function (done) {
//
//        var data;
//
//        http.get(proxyHost, function (res) {
//            var chunks = [];
//            res.on("data", function (chunk) {
//                chunks.push(chunk.toString());
//            });
//            res.on("end", function () {
//                data = chunks.join("");
//                assert.deepEqual(~data.indexOf("0.0.0.0:8000"), 0);
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
//    var proxyServer, reqCallback;
//
//    before(function () {
//
//        reqCallback = sinon.spy(function (req, res, next) {
//            next();
//        });
//        var options = {
//            proxy: {
//                host: "firecrest.dev",
//                port: 8888
//            }
//        };
//        proxyServer = proxy.createProxy("0.0.0.0", ports, options,reqCallback);
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
//        http.get(proxyHost, function (res) {
//            var data;
//            var chunks = [];
//            res.on("data", function (chunk) {
//                chunks.push(chunk.toString());
//            });
//            res.on("end", function () {
//                data = chunks.join("");
//                assert.isTrue(data.indexOf(snippet) >= 0);
//                done();
//            });
//        });
//    });
//});