var bs = require("../../lib/browser-sync");
var clientIo = require("socket.io-client");
var browserSync = new bs();
var assert = require("chai").assert;
var sinon = require("sinon");

var userOptions = {
    ghostMode: true
};

var ports = {
    socket: 3000,
    controlPanel: 3001,
    proxy: 3002
};

var socketUrl = "http://0.0.0.0:" + ports.socket;

describe("setup Socket", function () {

    var io;
    var events;

    before(function () {
        events = ["random", "inputchange"];
    });

    beforeEach(function () {
        io = browserSync.setupSocket(ports);
        browserSync.handleSocketConnection(events, userOptions);
    });

    it("can start the socket IO server", function () {
        assert.isDefined(io.sockets);
        browserSync.killSocket();
    });

    it("can log a new connection", function (done) {
        var spy = sinon.spy(browserSync, "logConnection");
        clientIo.connect(socketUrl, {"force new connection":true});
        setTimeout(function () {
            sinon.assert.called(spy);
            done();
        }, 200);
    });
});

