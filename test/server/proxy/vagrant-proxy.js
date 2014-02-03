//var bs = require("../../lib/browser-sync");
//var browserSync = new bs();
//var messages = require("../../lib/messages");
//var http = require("http");
//var filePath = require("path");
//var connect = require("connect");
//var sinon = require("sinon");
//var proxy = require("../../lib/proxy");
//var assert = require("chai").assert;
//
//var ports = {
//    socket: 3000,
//    controlPanel: 3001,
//    proxy: 3002
//};
//var options = {};
//var proxyHost = "http://0.0.0.0:" + ports.proxy;
//
//var snippet = messages.scriptTags("0.0.0.0", ports, options);
//
//describe("Launching a proxy for a vagrant based server", function () {
//
//    var app, server, proxyServer, reqCallback;
//
//    before(function () {
//
//        reqCallback = sinon.spy(function (req, res, next) {
//            next();
//        });
//
//        var options = {
//            proxy: {
//                host: "172.22.22.22"
//            }
//        };
//
//        proxyServer = proxy.createProxy("0.0.0.0", ports, options, reqCallback);
//
//    });
//
//    after(function () {
//        proxyServer.close();
//    });
//
//    it("can proxy request", function (done) {
//        http.get(proxyHost, function (res) {
//            var actual = res.statusCode;
//            assert.equal(actual, 200);
//            done();
//        });
//    });
//    it("can return the correct content", function (done) {
//        var data;
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
//    it("can return the correct content if gzip enabled", function (done) {
//        var data;
//
//        var options = {
//            host: "0.0.0.0",
//            port: ports.proxy,
//            path: "/",
//            method: "GET",
//            headers: { "accept-encoding": "gzip" }
//        };
//
//        http.request(options, function (res) {
//            var chunks = [];
//            res.on("data", function (chunk) {
//                chunks.push(chunk.toString());
//            });
//            res.on("end", function () {
//                data = chunks.join("");
//                assert.isTrue(data.indexOf(snippet) >= 0);
//                done();
//            });
//        }).end();
//    });
//});