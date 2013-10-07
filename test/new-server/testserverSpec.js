var si = require("../../lib/style-injector");
var styleInjector = new si();
var messages = require("../../lib/messages");
var http = require("http");

var ports = [3001, 3002];

describe("Launching a server", function () {

    describe("server for client-side JS", function () {

        var clientScripturl = "http://localhost:" + ports[1] + messages.clientScript;

        it("can serve the JS file", function () {

            var options = {
                server: {
                    baseDir: "test/fixtures"
                }
            };

            var server;

            setTimeout(function () {
                server = styleInjector.launchServer("localhost", ports, options);

                http.get(clientScripturl, function (res) {
                    expect(res.statusCode).toBe(200);
                });

            }, 1);

            waits(10);

            runs(function () {
                server.close();
            });
        });

        it("can append the code needed to connect to socketIO", function () {
            var server;
            var expectedString = "var ___socket___ = io.connect('localhost:" + ports[0] + "');";


            var options = {
                server: {
                    baseDir: "test/fixtures"
                }
            };
            setTimeout(function () {
                server = styleInjector.launchServer("localhost", ports, options);
                http.get(clientScripturl, function (res) {
                    res.on("data", function (chunk) {
                        expect(chunk.toString().indexOf(expectedString)).toBe(0);
                    });
                });
            }, 1);

            waits(10);

            runs(function () {
                server.close();
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
            var server;

            server = styleInjector.launchServer("localhost", ports, options);
            http.get("http://localhost:" + ports[1] + "/index.html", function (res) {
                expect(res.statusCode).toBe(200);
            });

            waits(10);

            runs(function () {
                server.close();
            });
        });

        it("can append the script tags to the body of html files", function () {
            var options = {
                server: {
                    baseDir: "test/fixtures",
                    injectScripts: true
                }
            };

            var server = styleInjector.launchServer("localhost", ports, options);
            http.get("http://localhost:" + ports[1] + "/index.html", function (res) {
                res.setEncoding('utf8');
                res.on("data", function (chunk) {

                    var expectedMatch1 = "<script src='http://localhost:" + ports[0] + messages.socketIoScript + "'></script>";
                    var expectedMatch2 = "<script src='http://localhost:" + ports[1] + messages.clientScript + "'></script>"

                    expect(chunk.toString().indexOf(expectedMatch1) >= 0).toBe(true);
                    expect(chunk.toString().indexOf(expectedMatch2) >= 0).toBe(true);
                });
            });

            waits(10);

            runs(function () {
                server.close();
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
            var server;
            spyOn(styleInjector, "openBrowser");

            setTimeout(function () {
                server = styleInjector.launchServer("localhost", ports, options);
            }, 1);

            waits(10);

            runs(function () {
                expect(styleInjector.openBrowser).toHaveBeenCalledWith("localhost", 3002, options);
                server.close();
            });
        });

        describe("logging server info", function () {

            var msgs;
            beforeEach(function(){
                msgs = styleInjector.getMessages();
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

                var server;

                setTimeout(function () {
                    server = styleInjector.launchServer("localhost", ports, options);
                }, 1);

                waits(10);

                runs(function () {
                    expect(msgs.initServer).toHaveBeenCalled();
                    server.close();
                });
            });
            it("doesn't log if no server used", function () {

                spyOn(msgs, "init");
                var options = {
                    server: false
                };

                var server;

                setTimeout(function () {
                    server = styleInjector.launchServer("localhost", ports, options);
                }, 1);

                waits(10);

                runs(function () {
                    expect(msgs.init).toHaveBeenCalled();
                    server.close();
                });
            });
        });
    });
});
