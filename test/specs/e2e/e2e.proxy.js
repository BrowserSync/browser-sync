"use strict";

var browserSync = require("../../../index");

var http = require("http");
var connect = require("connect");
var serveStatic = require("serve-static");
var request = require("supertest");
var assert = require("chai").assert;
var client = require("socket.io-client");
var portScanner = require("portscanner");

describe("E2E proxy test", function () {

    var instance, stubServer;

    before(function (done) {
        browserSync.reset();

        portScanner.findAPortNotInUse(3000, 4000, {
            host: "localhost",
            timeout: 1000
        }, function (err, port) {
            if (err) {
                throw err;
            }

            var config = {
                proxy:     "localhost:" + port,
                logLevel: "silent",
                open:      false
            };

            var testApp = connect()
                .use(serveStatic(__dirname + "/../../fixtures"));

            // server to proxy
            stubServer = http.createServer(testApp).listen(port);

            instance = browserSync.init([], config, done).instance;
        });
    });

    after(function () {
        instance.cleanup();
        stubServer.close();
    });

    it("can init proxy & serve a page", function (done) {

        assert.isString(instance.options.snippet);
        assert.isDefined(instance.server);

        request(instance.server)
            .get("/index-large.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "browser-sync-client");
                done();
            });
    });

    it("Can proxy websockets", function (done) {

        var called;
        instance.io.sockets.on("connection", function () {
            if (!called) {
                called = true;
                done();
            }
        });

        var connectionUrl = instance.options.urls.local + instance.options.socket.namespace;
        var clientSockets = client(connectionUrl, {path: instance.options.socket.path});

        clientSockets.emit("shane", {name: "shane"});
    });

    it("Can serve the script", function (done) {

        request(instance.server)
            .get(instance.options.scriptPaths.versioned)
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "Connected to BrowserSync");
                done();
            });
    });

    it("Can serve files with snippet added", function (done) {
        request(instance.options.urls.local)
            .get("/")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, instance.options.snippet);
                done();
            });
    });
});

describe("E2E proxy test", function () {

    before(function () {
        browserSync.reset();
    });

    it("can check if the proxy is reachable", function (done) {

        var instance;

        var config = {
            proxy:     "localhost:3434",
            logLevel: "silent",
            open:      false
        };

        browserSync.emitter.on("config:warn", function (data) {
            assert.equal(data.msg, "Proxy address not reachable - is your server running?");
            instance.cleanup();
            done();
        });
        // Success if this event called
        instance = browserSync(config).instance;
    });
});
