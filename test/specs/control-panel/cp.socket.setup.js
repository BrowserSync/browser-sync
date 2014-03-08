"use strict";

var socket   = require("../../../lib/sockets");
var clientIo = require("socket.io-client");

var assert   = require("chai").assert;
var sinon    = require("sinon");
var events   = require("events");
var emitter = new events.EventEmitter();

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
    var spy;

    before(function () {
        events = ["random", "inputchange"];
        spy = sinon.spy(emitter, "emit");
    });

    beforeEach(function () {
        io = socket.init(ports.socket, events, userOptions, emitter);
    });

    it("can start the socket IO server", function () {
        assert.isDefined(io.sockets);
        io.server.close();
    });

    it("can log a new connection", function (done) {
        clientIo.connect(socketUrl, {"force new connection":true});
        setTimeout(function () {
            sinon.assert.called(spy);
            done();
        }, 100);
    });
});

