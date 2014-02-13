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
    var cb = sinon.spy();
    var cb2 = sinon.spy();
    var events;

    before(function () {

        events = [
            {
                name: "random",
                callback: cb
            },
            {
                name: "inputchange",
                callback: cb2
            }
        ];

    });
    afterEach(function () {
        cb.reset();
        cb2.reset();
    });

    beforeEach(function () {
        io = browserSync.setupSocket(ports);
        browserSync.handleSocketConnection(events, userOptions, browserSync.handleClientSocketEvent);
    });

    it("can start the socket IO server", function () {
        assert.isDefined(io.sockets);
        browserSync.killSocket();
    });
	
	// @todo Add test for mulitple socket.io clients.

    it("can listen for client events when ghost mode Enabled", function (done) {

        var socket = clientIo.connect(socketUrl, {"force new connection":true});
		
			// Join a room.
			// https://github.com/LearnBoost/socket.io/wiki/Rooms
			//socket.join("browser-sync");
			
            socket.emit("random", {});
            socket.emit("inputchange", {});

        setTimeout(function () {
            sinon.assert.called(cb);
            sinon.assert.called(cb2);
            done();
        }, 200);

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

