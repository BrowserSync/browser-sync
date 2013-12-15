var si = require("../../../lib/browser-sync");
var messages = require("../../../lib/messages");
var browserSync = new si();
var http = require("http");

var ports = [3000, 3001, 3002, 3003];
/**
 *
 *
 *
 */
describe("Launching the Control panel", function () {

    var controlPanelServer;
    beforeEach(function () {
        controlPanelServer = browserSync.launchControlPanel("0.0.0.0", ports);
    });
    afterEach(function () {
        controlPanelServer.close();
    });

    it("should launch and be accessible via http", function () {
        var statusCode;

        http.get("http://0.0.0.0:3003", function (res) {
            statusCode = res.statusCode;
        });

        waitsFor(function () {
            return statusCode;
        }, "Took too long", 1000);

        runs(function () {
            expect(statusCode).toBe(200);
        });
    });

    it("should launch and be able to access JS", function () {
        var statusCode;

        http.get("http://0.0.0.0:3003/js/app.js", function (res) {
            statusCode = res.statusCode;
        });

        waitsFor(function () {
            return statusCode;
        }, "Took too long", 1000);

        runs(function () {
            expect(statusCode).toBe(200);
        });
    });

    it("should have the snippets attached", function () {
        var data;

        http.get("http://0.0.0.0:3003", function (res) {
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
            expect(data.indexOf("socket.io/socket.io.js") >= 0).toBe(true);
            expect(data.indexOf("js/app.js") >= 0).toBe(true);
        });

    });


    it("can append the code needed to connect to socketIO", function () {

        var expectedString = "var ___socket___ = io.connect('http://0.0.0.0:" + ports[0] + "');";

        var respString;

        http.get("http://0.0.0.0:3003/js/app.js", function (res) {

            res.on("data", function (chunk) {
                respString = chunk.toString();
            });
        });

        waitsFor(function () {
            return respString;
        }, "Took too long", 1000);

        runs(function () {
            expect(respString.indexOf(expectedString)).toBe(0);
        });
    });
});
