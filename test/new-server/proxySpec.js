var si = require("../../lib/browser-sync");
var browserSync = new si();
var messages = require("../../lib/messages");
var http = require("http");
var filePath = require("path");
var connect = require("connect");
var createProxy = require('../../lib/dev-proxy');

var ports = [3000, 3001, 3002];

var expectedMatch1 = "<script src='http://0.0.0.0:" + ports[0] + messages.socketIoScript + "'></script>";
var expectedMatch2 = "<script src='http://0.0.0.0:" + ports[1] + messages.clientScript + "'></script>";

describe("Launching a proxy for connect server", function () {

    var app, server, proxyServer;

    beforeEach(function () {

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
    afterEach(function () {
        server.close();
        proxyServer.close();
    });


    it("can proxy requests", function () {

        var respCode;

        http.get("http://0.0.0.0:" + ports[2] + "/index.html", function (res) {
            respCode = res.statusCode;
        });

        waitsFor(function () {
            return respCode;
        }, "Took too long to get request", 1000);

        runs(function () {
            expect(respCode).toBe(200);
        });
    });


    it("can proxy requests + inject snippets", function () {

        var data;

        http.get("http://0.0.0.0:" + ports[2] + "/index.html", function (res) {
            res.setEncoding('utf8');
            var chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk.toString());
            });
            res.on("end", function () {
                data = chunks.join("");
            });
        });

        waitsFor(function () {
            return data;
        }, "Took too long to get request", 1000);

        runs(function () {
            expect(data.indexOf(expectedMatch1) >= 0).toBe(true);
            expect(data.indexOf(expectedMatch2) >= 0).toBe(true);
        });
    });
    it("can proxy requests + inject snippets", function () {

        var data;

        http.get("http://0.0.0.0:" + ports[2] + "/index-large.html", function (res) {
            res.setEncoding('utf8');
            var chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk.toString());
            });
            res.on("end", function () {
                data = chunks.join("");
            });
        });

        waitsFor(function () {
            return data;
        }, "Took too long to get request", 1000);

        runs(function () {
            expect(data.indexOf(expectedMatch1) >= 0).toBe(true);
            expect(data.indexOf(expectedMatch2) >= 0).toBe(true);
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
//    var proxyServer, expectedMatch1, expectedMatch2;
//
//    beforeEach(function () {
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
//    afterEach(function () {
//        proxyServer.close();
//    });
//
//    it("can proxy requests", function () {
//
//        var respCode;
//
//        http.get("http://0.0.0.0:" + ports[2], function (res) {
//            respCode = res.statusCode;
//        });
//
//        waitsFor(function () {
//            return respCode;
//        }, "Took too long to get request", 1000);
//
//        runs(function () {
//            expect(respCode).toBe(200);
//        });
//    });
//    it("can proxy requests + inject snippets", function () {
//
//        var data;
//
//        http.get("http://0.0.0.0:" + ports[2], function (res) {
//            res.setEncoding('utf8');
//            var chunks = [];
//
//            res.on("data", function (chunk) {
//                chunks.push(chunk.toString());
//            });
//            res.on("end", function () {
//                data = chunks.join("");
//            });
//        });
//
//        waitsFor(function () {
//            return data;
//        }, "Took too long to get request", 1000);
//
//        runs(function () {
//            expect(data.indexOf(expectedMatch1) >= 0).toBe(true);
//            expect(data.indexOf(expectedMatch2) >= 0).toBe(true);
//        });
//    });
//});

/**
 *
 *
 * Testing proxy with external VHOST + port server such as "local.dev:8888"
 *
 *
 */
//describe("Launching a proxy for external PHP server", function () {
//
//    var proxyServer;
//
//    beforeEach(function () {
//
//        // Server we are proxying
//        var options = {
//            proxy: {
//                host: "firecrest.dev",
//                port: 8888
//            }
//        };
//
//        proxyServer = createProxy("0.0.0.0", ports, options);
//
//    });
//
//    afterEach(function () {
//        proxyServer.close();
//    });
//
//    it("can proxy requests", function () {
//
//        var respCode;
//
//        http.get("http://0.0.0.0:" + ports[2], function (res) {
//            respCode = res.statusCode;
//        });
//
//        waitsFor(function () {
//            return respCode;
//        }, "Took too long to get request", 1000);
//
//        runs(function () {
//            expect(respCode).toBe(200);
//        });
//    });
//    it("can proxy requests + inject snippets", function () {
//
//        var data;
//
//        http.get("http://0.0.0.0:" + ports[2], function (res) {
//            res.setEncoding('utf8');
//            var chunks = [];
//
//            res.on("data", function (chunk) {
//                chunks.push(chunk.toString());
//            });
//            res.on("end", function () {
//                data = chunks.join("");
//            });
//        });
//
//        waitsFor(function () {
//            return data;
//        }, "Took too long to get request", 1000);
//
//        runs(function () {
//            expect(data.indexOf(expectedMatch1) >= 0).toBe(true);
//            expect(data.indexOf(expectedMatch2) >= 0).toBe(true);
//        });
//    });
//});
