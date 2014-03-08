"use strict";

var messages    = require("../../../lib/messages");
var proxy       = require("../../../lib/proxy");
var http        = require("http");
var filePath    = require("path");
var connect     = require("connect");
var portScanner = require("portscanner-plus");

var request     = require("supertest");
var assert      = require("chai").assert;

var ports = {
    socket: 3000,
    controlPanel: 3001,
    proxy: 3002
};

var options = {
    proxy: {
        host: "0.0.0.0"
    }
};

describe("Launching a proxy for connect server", function () {

    var server;
    var app;

    before(function (done) {

        portScanner.getPorts(1, 3000, 4000).then(function (port) {
            var testApp = connect()
                .use(function (req, res, next) {
                    res.setHeader("content-encoding", "gzip");
                    res.setHeader("content-length", "1024");
                    next();
                })
                .use(connect.static(filePath.resolve("test/fixtures")));

            server = http.createServer(testApp).listen(port[0]);
            options.proxy.port = port[0];
            app = proxy.createProxy("0.0.0.0", ports, options);
            done();
        });
    });

    after(function () {
        server.close();
    });

    it("can proxy requests for html files", function (done) {
        request(app)
            .get("/index.html")
            .expect(200, done);
    });
    it("can proxy requests for html files (2)", function (done) {
        request(app)
            .get("/index-large.html")
            .expect(200, done);
    });
    it("can remove content-encoding headers", function (done) {
        request(app)
            .get("/proxy-headers.html")
            .expect(200)
            .end(function (err, res) {
                var actual = res.headers.hasOwnProperty("content-encoding");
                assert.isFalse(actual);
                done();
            });
    });
    it("can remove content-length headers", function (done) {
        request(app)
            .get("/proxy-headers.html")
            .expect(200)
            .end(function (err, res) {
                var actual = res.headers.hasOwnProperty("content-length");
                assert.isFalse(actual);
                done();
            });
    });
});