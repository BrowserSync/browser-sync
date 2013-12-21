var si = require("../../lib/browser-sync");
var browserSync = new si();
var messages = require("../../lib/messages");
var http = require("http");

var ports = [3001, 3002];

describe("Launching a server", function () {

    describe("server for client-side JS", function () {

        var clientScriptUrl = "http://localhost:" + ports[1] + messages.clientScript;

        it("can serve the JS file", function () {

            var options = {
                server: {
                    baseDir: "test/fixtures"
                }
            };

            var servers;
            var respCode;

            servers = browserSync.launchServer("localhost", ports, options);

            http.get(clientScriptUrl, function (res) {
                respCode = res.statusCode;
            });

            waitsFor(function () {
                return respCode;
            }, "Took too long to get request", 1000);

            runs(function () {
                servers.staticServer.close();
                expect(respCode).toBe(200);
            });

        });

        it("can append the code needed to connect to socketIO", function () {
            var servers;
            var expectedString = "var ___socket___ = io.connect('http://localhost:" + ports[0] + "');";

            var options = {
                server: {
                    baseDir: "test/fixtures"
                }
            };

            var respString;

            servers = browserSync.launchServer("localhost", ports, options);

            http.get(clientScriptUrl, function (res) {

                res.on("data", function (chunk) {
                    respString = chunk.toString();
                });
            });

            waitsFor(function () {
                return respString;
            }, "Took too long", 1000);

            runs(function () {
                servers.staticServer.close();
                expect(respString.indexOf(expectedString)).toBe(0);
            });
        });
    });

    describe("server for Static Files", function () {
        it("can serve files", function () {

            var options = {
                server: {
                    baseDir: "test/fixtures"
                }
            };
            var servers;
            var respCode;

            servers = browserSync.launchServer("localhost", ports, options);

            http.get("http://localhost:" + ports[1] + "/index.html", function (res) {
                respCode = res.statusCode;
            });

            waitsFor(function () {
                return respCode;
            }, "Took too long", 1000);

            runs(function () {
                servers.staticServer.close();
                expect(respCode).toBe(200);
            });
        });


        it("can serve an index.html, or index.htm from root", function () {
            var options = {
                server: {
                    baseDir: "test/fixtures/alt",
                    index: "index.htm"
                }
            };

            var servers = browserSync.launchServer("localhost", ports, options);
            var respCode;

            http.get("http://localhost:" + ports[1], function (res) {
                respCode = res.statusCode;
            });

            waitsFor(function () {
                return respCode;
            }, "Took too long", 1000);

            runs(function () {
                servers.staticServer.close();
                expect(respCode).toBe(200);
            });

        });
        it("can serve an index.html, or index.htm from root (2)", function () {
            var options = {
                server: {
                    baseDir: "test/fixtures"
                }
            };
            var servers, respCode;

            servers = browserSync.launchServer("localhost", ports, options);

            http.get("http://localhost:" + ports[1], function (res) {
                respCode = res.statusCode;
            });

            waitsFor(function () {
                return respCode;
            }, "Took too long", 1000);

            runs(function () {
                servers.staticServer.close();
                expect(respCode).toBe(200);
            });

        });

        it("does not serve static files if server:false", function () {
            var options = {
                server: false
            };
            var servers, respCode;

            servers = browserSync.launchServer("localhost", ports, options);

            http.get("http://0.0.0.0:" + ports[1], function (res) {
                respCode = res.statusCode;
            });

            waitsFor(function () {
                return respCode;
            }, "Took too long", 1000);

            runs(function () {
                servers.staticServer.close();
                expect(respCode).toBe(404);
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

            spyOn(browserSync, "openBrowser");

            var servers = browserSync.launchServer("localhost", ports, options);

            waits(100);

            runs(function () {
                expect(browserSync.openBrowser).toHaveBeenCalledWith("localhost", 3002, options);
                servers.staticServer.close();
            });
        });

        describe("logging server info", function () {

            var msgs;
            beforeEach(function(){
                msgs = browserSync.getMessages();
            });

            it("logs when using static server", function () {

                spyOn(msgs, "initServer");
                var options = {
                    server: {
                        baseDir: "test/fixtures",
                        injectScripts: true,
                        openBrowser: true
                    }
                };

                var servers = browserSync.launchServer("localhost", ports, options);

                waits(10);

                runs(function () {
                    expect(msgs.initServer).toHaveBeenCalled();
                    servers.staticServer.close();
                });
            });
            it("logs when using proxy", function () {

                spyOn(msgs, "initProxy");

                var options = {
                    proxy: {
                        host: '192.168.0.1'
                    }
                };

                var servers = browserSync.launchServer("localhost", ports, options);

                waits(100);

                runs(function () {
                    expect(msgs.initProxy).toHaveBeenCalled();
                    servers.proxyServer.close();
                    servers.staticServer.close();
                });
            });
            it("doesn't log if no server used", function () {

                spyOn(msgs, "init");
                var options = {
                    server: false
                };

                var servers;

                setTimeout(function () {
                    servers = browserSync.launchServer("localhost", ports, options);
                }, 1);

                waits(10);

                runs(function () {
                    expect(msgs.init).toHaveBeenCalled();
                    servers.staticServer.close();
                });
            });
        });
    });
});
