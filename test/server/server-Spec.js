var bs = require("../../lib/browser-sync");
var browserSync = new bs();
var messages = require("../../lib/messages");
var http = require("http");
var assert = require("chai").assert;
var sinon = require("sinon");

var ports = [3001, 3002];

describe("Launching a server: ", function () {

    describe("serving the client-side JS", function () {

        var clientScriptUrl = "http://localhost:" + ports[1] + messages.clientScript;

        it("can serve the JS file", function (done) {

            var options = {
                server: {
                    baseDir: "test/fixtures"
                }
            };

            var servers = browserSync.launchServer("localhost", ports, options);

            http.get(clientScriptUrl, function (res) {

                var actual = res.statusCode;
                assert.equal(actual, 200);

                servers.staticServer.close();
                done();
            });
        });

        it("can append the code needed to connect to socketIO", function (done) {
            var expectedString = "var ___socket___ = io.connect('http://localhost:" + ports[0] + "');";

            var options = {
                server: {
                    baseDir: "test/fixtures"
                }
            };

            var servers = browserSync.launchServer("localhost", ports, options);

            http.get(clientScriptUrl, function (res) {

                res.on("data", function (chunk) {
                    var respString = chunk.toString();
                    var actual = respString.indexOf(expectedString);

                    assert.equal(actual, 0);
                    servers.staticServer.close();

                    done();
                });
            });

        });

        describe("server for Static Files", function () {

            it("can serve files", function (done) {
                var options = {
                    server: {
                        baseDir: "test/fixtures"
                    }
                };
                var servers = browserSync.launchServer("localhost", ports, options);

                http.get("http://localhost:" + ports[1] + "/index.html", function (res) {
                    var actual = res.statusCode;
                    assert.equal(actual, 200);
                    servers.staticServer.close();
                    done();
                });
            });


            it("can serve an index.html, or index.htm from root", function (done) {
                var options = {
                    server: {
                        baseDir: "test/fixtures/alt",
                        index: "index.htm"
                    }
                };

                var servers = browserSync.launchServer("localhost", ports, options);

                http.get("http://localhost:" + ports[1], function (res) {
                    var actual = res.statusCode;
                    assert.equal(actual, 200);
                    servers.staticServer.close();
                    done();
                });
            });

            it("can serve an index.html, or index.htm from root (2)", function (done) {
                var options = {
                    server: {
                        baseDir: "test/fixtures"
                    }
                };

                var servers = browserSync.launchServer("localhost", ports, options);

                http.get("http://localhost:" + ports[1], function (res) {
                    var actual = res.statusCode;
                    assert.equal(actual, 200);
                    servers.staticServer.close();
                    done();
                });
            });

            it("does not serve static files if server:false", function (done) {
                var options = {
                    server: false
                };
                var servers = browserSync.launchServer("localhost", ports, options);

                http.get("http://0.0.0.0:" + ports[1], function (res) {
                    var actual = res.statusCode;
                    assert.equal(actual, 404);
                    servers.staticServer.close();
                    done();
                });
            });

            it("can open the browser if not turned off in options", function () {
                var options = {
                    server: {
                        baseDir: "test/fixtures",
                        injectScripts: true,
                        openBrowser: true
                    }
                };

                var spy = sinon.spy(browserSync, "openBrowser");

                var servers = browserSync.launchServer("localhost", ports, options);

                assert.isTrue(spy.calledWith("localhost", 3002, options));
                servers.staticServer.close();

            });

            describe("logging server info", function () {

                it("logs when using static server", function () {

                    var spy = sinon.spy(messages, "initServer");

                    var options = {
                        server: {
                            baseDir: "test/fixtures",
                            injectScripts: true,
                            openBrowser: true
                        }
                    };

                    var servers = browserSync.launchServer("localhost", ports, options);

                    assert.isTrue(spy.called);

                    servers.staticServer.close();

                });
                it("logs when using proxy", function () {

                    var spy = sinon.spy(messages, "initProxy");

                    var options = {
                        proxy: {
                            host: "192.168.0.1"
                        }
                    };

                    var servers = browserSync.launchServer("localhost", ports, options);

                    assert.isTrue(spy.called);

                    servers.staticServer.close();
                    servers.proxyServer.close();

                });
                it("doesn't log if no server used", function () {

                    var spy = sinon.spy(messages, "init");

                    var options = {
                        server: false
                    };

                    var servers = browserSync.launchServer("localhost", ports, options);

                    assert.isTrue(spy.called);

                    servers.staticServer.close();
                });
            });
        });
    });
});