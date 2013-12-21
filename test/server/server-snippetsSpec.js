var si = require("../../lib/browser-sync");
var browserSync = new si();
var messages = require("../../lib/messages");
var http = require("http");

var ports = [3001, 3002];

var expectedMatch1 = "<script src='http://0.0.0.0:" + ports[0] + messages.socketIoScript + "'></script>";
var expectedMatch2 = "<script src='http://0.0.0.0:" + ports[1] + messages.clientScript + "'></script>";

describe("Launching a server with snippets", function () {

    var servers;

    beforeEach(function () {

        var options = {
            server: {
                baseDir: "test/fixtures",
                injectScripts: true
            }
        };

        servers = browserSync.launchServer("0.0.0.0", ports, options);
    });

    afterEach(function () {
        servers.staticServer.close();
    });

    /**
     *
     *
     * SMALL HTML PAGE
     *
     *
     */
    it("can append the script tags to the body of html files", function () {

        var data;

        http.get("http://0.0.0.0:" + ports[1] + "/index.html", function (res) {
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
        }, "Took too long", 1000);

        runs(function () {
            expect(data.indexOf(expectedMatch1) >= 0).toBe(true);
            expect(data.indexOf(expectedMatch2) >= 0).toBe(true);
        });
    });

    /**
     *
     *
     * LARGE HTML PAGE
     *
     *
     */
    it("can append the script tags to the body of a LARGE html FILE", function () {

        var data;

        http.get("http://0.0.0.0:" + ports[1] + "/index-large.html", function (res) {
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
        }, "Took too long", 1000);

        runs(function () {
            expect(data.indexOf(expectedMatch1) >= 0).toBe(true);
            expect(data.indexOf(expectedMatch2) >= 0).toBe(true);
        });
    });
});
