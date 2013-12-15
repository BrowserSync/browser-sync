var si = require("../../../lib/browser-sync");
var messages = require("../../../lib/messages");
var browserSync = new si();
var http = require("http");

var ports = [3000,3001,3002,3003];
/**
 *
 *
 *
 */
describe("Launching the Control panel", function () {

    var controlPanelServer;
    beforeEach(function(){
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

    it("can append the code needed to connect to socketIO", function () {

        var expectedString = "var ___socket___ = io.connect('http://0.0.0.0:" + ports[0] + "');";

        var respString;

        http.get("http://0.0.0.0:3003/browser-sync-client.min.js", function (res) {

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
