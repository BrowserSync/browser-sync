var bs = require("../../lib/browser-sync");
var browserSync = new bs();
var messages = require("../../lib/messages");
var http = require("http");
var assert = require("chai").assert;
var server = require("../../lib/server");

var ports = [3001, 3002];
var serverHost = "http://0.0.0.0:" + ports[1];

var expectedMatch1 = "<script src='//0.0.0.0:" + ports[0] + messages.socketIoScript + "'></script>";
var expectedMatch2 = "<script src='//0.0.0.0:" + ports[1] + messages.clientScript + "'></script>";

describe("Launching a server with snippets", function () {

    var servers;

    beforeEach(function () {

        var options = {
            server: {
                baseDir: "test/fixtures",
                injectScripts: true
            }
        };

        servers = server.launchServer("0.0.0.0", ports, options);
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
    it("can append the script tags to the body of html files", function (done) {

        http.get(serverHost + "/index.html", function (res) {
            var chunks = [];
            var data;
            res.on("data", function (chunk) {
                chunks.push(chunk.toString());
            });
            res.on("end", function () {
                data = chunks.join("");
                assert.isTrue(data.indexOf(expectedMatch1) >= 0);
                assert.isTrue(data.indexOf(expectedMatch2) >= 0);
                done();
            });
        });
    });

    /**
     *
     *
     * LARGE HTML PAGE
     *
     *
     */
//    it("can append the script tags to the body of a LARGE html FILE", function (done) {
//        http.get(serverHost + "/index-large.html", function (res) {
//            var chunks = [];
//            var data;
//            res.on("data", function (chunk) {
//                chunks.push(chunk.toString());
//            });
//            res.on("end", function () {
//                data = chunks.join("");
//                assert.isTrue(data.indexOf(expectedMatch1) >= 0);
//                assert.isTrue(data.indexOf(expectedMatch2) >= 0);
//                done();
//            });
//        });
//    });
});
