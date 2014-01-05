var bs = require("../../lib/browser-sync");
var browserSync = new bs();
var messages = require("../../lib/messages");
var http = require("http");
var sinon = require("sinon");
var assert = require("chai").assert;
var server = require("../../lib/server");

var ports = {
    socket: 3000,
    controlPanel: 3001,
    server: 3002
};

var serverHost = "http://0.0.0.0:" + ports.server;

var expectedMatch1 = "<script src='//0.0.0.0:" + ports.socket + messages.socketIoScript + "'></script>";
var expectedMatch2 = "<script src='//0.0.0.0:" + ports.controlPanel + messages.clientScript() + "'></script>";

describe("Launching a server with snippets", function () {

    var servers, reqCallback;

    var io;
    var clientsSpy;
    var emitSpy;

    before(function () {
        clientsSpy = sinon.stub().returns([]);
        emitSpy = sinon.spy();
        io = {
            sockets: {
                clients: clientsSpy,
                emit: emitSpy
            }
        };
    });
    afterEach(function () {
        clientsSpy.reset();
        emitSpy.reset();
    });

    beforeEach(function () {

        var options = {
            server: {
                baseDir: "test/fixtures",
                injectScripts: true
            }
        };

        servers = server.launchServer("0.0.0.0", ports, options, io);
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
    it("can append the script tags to the body of a LARGE html FILE", function (done) {
        http.get(serverHost + "/index-large.html", function (res) {
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
});
