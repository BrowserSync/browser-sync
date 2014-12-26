"use strict";

var browserSync = require("../../../index");
var tunnel = require("../../../lib/tunnel");

var http = require("http");
var sinon = require("sinon");
var assert = require("chai").assert;

describe("Tunnel e2e tests", function () {

    describe("E2E server test with tunnel", function () {

        var instance;

        before(function (done) {
            browserSync.reset();
            var config = {
                server:    {
                    baseDir: "test/fixtures"
                },
                logLevel: "silent",
                open:      false,
                tunnel:    true,
                online:    true
            };
            instance = browserSync(config).instance;
            instance.events.on("service:running", function () {
                done();
            });
        });

        after(function () {
            instance.cleanup();
        });

        it("should call init on the tunnel", function () {
            assert.include(instance.options.urls.tunnel, "localtunnel.me");
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
                    urls: {},
                    port: _port
                },
                events:  {}
            }, require("localtunnel"), function (url, bool) {
                assert.include(url, "localtunnel.me");
                assert.isTrue(bool);
                done();
            });
        });
        it("can create a tunnel connection with sub domain", function (done) {
            tunnel.plugin({
                options: {
                    urls:   {},
                    tunnel: "shane0987654321",
                    port:   _port
                },
                events:  {}
            }, require("localtunnel"), function (url, bool) {
                assert.include(url, "shane0987654321");
                assert.isTrue(bool);
                done();
            });
        });
    });

    describe("Creating tunnels", function () {

        var tunnelStub;

        before(function () {
            tunnelStub = sinon.stub().yields(null, {
                url: "http://localhost:403"
            });
        });

        afterEach(function () {
            tunnelStub.reset();
        });

        it("should return the URL & boolean if successful", function (done) {
            tunnel.plugin({
                options: {
                    urls:   {},
                    tunnel: true,
                    port:   1234
                }
            }, tunnelStub, function (url, tunnel) {
                assert.equal(url, "http://localhost:403");
                assert.equal(tunnel, true);
                done();
            });
        });
        it("should throw if localtunnel throws", function () {
            var spy = sinon.spy();
            tunnelStub.yields({
                msg: "ERR bro"
            });
            assert.throws(function () {
                tunnel.plugin({
                    options: {
                        urls:   {},
                        tunnel: true,
                        port:   1234
                    }
                }, tunnelStub, spy);
            });
        });
        it("should create a tunnel with a subdomain", function () {
            tunnelStub.yields(null, {
                url: "http://localhost:403"
            });
            var spy = sinon.spy();
            tunnel.plugin({
                options: {
                    urls:   {},
                    tunnel: "shane",
                    port:   1234
                }
            }, tunnelStub, spy);
            sinon.assert.called(tunnelStub);
        });
    });
});
