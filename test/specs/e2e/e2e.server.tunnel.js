"use strict";

var browserSync   = require("../../../index");
var tunnel        = require("../../../lib/tunnel");

var http    = require("http");
var assert  = require("chai").assert;

describe("E2E server test with tunnel", function () {

    var instance;

    before(function (done) {

        var config = {
            server: {
                baseDir:"test/fixtures"
            },
            debugInfo: false,
            open: false,
            tunnel: true,
            online: true
        };

        browserSync.use({
            "plugin:name": "tunnel",
            "plugin": function (bs, port, finished) {
                finished("http://localhost:8080", true);
            }
        });

        instance = browserSync(config, done);
    });

    after(function () {
        instance.cleanup();
    });

    it("should call init on the tunnel", function () {
        assert.equal(instance.options.urls.tunnel, "http://localhost:8080");
    });
});

describe("E2E server test with tunnel", function () {

    var _port;
    var server;

    before(function (done) {

        server = http.createServer();
        server.on("request", function (req, res) {
            res.write(req.headers.host);
            res.end();
        });
        server.listen(function () {
            _port = server.address().port;
            done();
        });
    });
    it("can create a tunnel connection", function (done) {
        tunnel.plugin({
            options: {
                urls: {}
            },
            events: {}
        }, _port, function (url, bool) {
            assert.include(url, "localtunnel.me");
            assert.isTrue(bool);
            done();
        });
    });
    it("can create a tunnel connection with sub domain", function (done) {
        tunnel.plugin({
            options: {
                urls: {},
                tunnel: "shane0987654321"
            },
            events: {}
        }, _port, function (url, bool) {
            assert.include(url, "shane0987654321");
            assert.isTrue(bool);
            done();
        });
    });
});
