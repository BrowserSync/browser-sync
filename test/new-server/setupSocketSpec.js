var si = require("../../lib/browser-sync");
var clientIo = require("socket.io-client");
var browserSync = new si();
var userOptions = {
    ghostMode: true
};

describe("setup Socket", function () {

    var ports = [3001,3002];
    var io;
    var cb;
    var cb2;
    var events;

    beforeEach(function () {

        cb = jasmine.createSpy("1");
        cb2 = jasmine.createSpy("2");

        events = [
            {
                name: "random",
                callback: function () {
                    cb.wasCalled = true;
                }
            },
            {
                name: "inputchange",
                callback: function () {
                    cb2.wasCalled = true;
                }
            }
        ];

        io = browserSync.setupSocket(ports);
        browserSync.handleSocketConnection(events, userOptions, browserSync.handleClientSocketEvent);


    });

    it("can start the socket IO server", function () {
        expect(io.sockets).toBeDefined();
        browserSync.killSocket();
    });

    it("can listen for client events when ghost mode Enabled", function () {

        var socket;

            socket = clientIo.connect("http://0.0.0.0:" + ports[0], {'force new connection':true});
            socket.emit("inputchange", {});
            socket.emit("random", {});

        waits(200);

        runs(function () {
            expect(cb2).toHaveBeenCalled();
            expect(cb).toHaveBeenCalled();
        });
    });
    it("can log a new connection", function () {

        spyOn(browserSync, 'logConnection');

        clientIo.connect("http://0.0.0.0:" + ports[0], {'force new connection':true});

        waits(200);

        runs(function () {
            expect(browserSync.logConnection).toHaveBeenCalled();
        });
    });
});

