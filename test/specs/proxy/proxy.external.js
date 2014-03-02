//var bs = require("../../lib/browser-sync");
//var browserSync = new bs();
//var messages = require("../../lib/messages");
//var http = require("http");
//var sinon = require("sinon");
//var proxy = require("../../lib/proxy");
//var assert = require("chai").assert;
//
//var ports = {
//    socket: 3000,
//    controlPanel: 3001,
//    proxy: 3002
//};
//
//var options = {};
//var proxyUrl = "0.0.0.0:3002";
//var snippet = messages.scriptTags("0.0.0.0", ports, options);
//var external = {
//    host: "0.0.0.0",
//    port: 8000
//};
//var externalUrl = "0.0.0.0:8000";
//
//describe.only("Launching a proxy for a vagrant based server", function () {
//
//    var proxyServer, reqCallback, options;
//
//    before(function () {
//
//        reqCallback = sinon.spy(function (req, res, next) {});
//
//        var options = {
//            proxy: external
//        };
//
//        proxyServer = proxy.createProxy("0.0.0.0", ports, options, reqCallback);
//
//    });
//
//    beforeEach(function () {
//        options = {
//            hostname: '0.0.0.0',
//            port: ports.proxy,
//            path: '/',
//            method: 'GET',
//            headers: {
//                accept: "text/html"
//            }
//        };
//    });
//
//    after(function () {
//        proxyServer.close();
//    });
//
//    it("can proxy request", function (done) {
//        http.request(options, function (res) {
//            var actual = res.statusCode;
//            assert.equal(actual, 200);
//            done();
//        }).end();
//    });
//    it("can return the correct content", function (done) {
//        var data;
//        http.request(options, function (res) {
//            var chunks = [];
//            res.on("data", function (chunk) {
//                chunks.push(chunk.toString());
//            });
//            res.on("end", function () {
//                data = chunks.join("");
//                assert.isTrue(data.indexOf(snippet) >= 0);
//                assert.isTrue(data.indexOf("</html>") >= 0);
//                assert.isTrue(data.indexOf(externalUrl) === -1);
////                assert.isTrue(data.indexOf(proxyUrl) >= 0);
//                done();
//            });
//        }).end();
//    });
//    it("can return the correct content if gzip enabled", function (done) {
//        var data;
//        options.headers["accept-encoding"] = "gzip";
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