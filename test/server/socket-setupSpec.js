var bs = require("../../lib/browser-sync");
var clientIo = require("socket.io-client");
var browserSync = new bs();
var assert = require("chai").assert;
var sinon = require("sinon");
var userOptions = {
    ghostMode: true
};

describe("setup Socket", function () {

    var ports = [3001,3002];
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

    it("can listen for client events when ghost mode Enabled", function (done) {

        var socket = clientIo.connect("http://0.0.0.0:" + ports[0], {"force new connection":true});
            socket.emit("random", {});
            socket.emit("inputchange", {});

        setTimeout(function () {
            assert.isTrue(cb.called);
            assert.isTrue(cb2.called);
            done();
        }, 200);

    });

    it("can log a new connection", function (done) {

        var spy = sinon.spy(browserSync, "logConnection");

        clientIo.connect("http://0.0.0.0:" + ports[0], {"force new connection":true});

        setTimeout(function () {
            assert.isTrue(spy.called);
            done();
        }, 200);

    });
});

