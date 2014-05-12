"use strict";

var socket   = require("../../../lib/sockets");
var clientIo = require("socket.io-client");

var assert   = require("chai").assert;
var sinon    = require("sinon");
var events   = require("events");
var request  = require("supertest");
var filePath = require("path");
var http     = require("http");
var connect  = require("connect");
var emitter  = new events.EventEmitter();

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
});

describe.only("Using the server/proxy for the socket", function(){
    it("should be able to serve static files", function(done){
        var testApp = connect()
            .use(connect.static(filePath.resolve("test/fixtures")));

        var server       = http.createServer(testApp);
        var socketServer = socket.init(server);

        request(server)
            .get("/socket.io/socket.io.js")
            .expect(200)
            .end(function (err, res) {
                console.log(res.text);
                done();
            })
    });
});

