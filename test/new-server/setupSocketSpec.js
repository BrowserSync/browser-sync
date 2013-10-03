var si = require("../../lib/style-injector");
var clientIo = require("socket.io-client");
var messages = require("../../lib/messages");
var styleInjector = new si();
var userOptions = {
    ghostMode: true
};
var testFile = "test/fixtures/test.txt";

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

        io = styleInjector.setupSocket(ports, userOptions);
        styleInjector.handleSocketConnection(events, userOptions, styleInjector.handleClientSocketEvent);

    });

    it("can start the socket IO server", function () {
        expect(io.sockets).toBeDefined();
        styleInjector.killSocket();
    });

    it("can listen for client events when ghost mode Enabled", function () {

        var socket;

        setTimeout(function () {
            socket = clientIo.connect("http://localhost:" + ports[0], {'force new connection':true});
            socket.emit("inputchange", {});
            socket.emit("random", {});
        }, 200);

        waits(800);

        runs(function () {
            expect(cb2).toHaveBeenCalled();
            expect(cb).toHaveBeenCalled();

        });
    });
    it("can log a new connection", function () {

        var socket;

        spyOn(styleInjector, 'logConnection');

        setTimeout(function () {
            socket = clientIo.connect("http://localhost:" + ports[0], {'force new connection':true});
        }, 100);

        waits(200);

        runs(function () {
            expect(styleInjector.logConnection).toHaveBeenCalled();
        });
    });
});

