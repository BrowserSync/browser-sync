var browserSync = require("../../../");

var socket = require("socket.io-client");

describe("E2E Sockets test", function() {
    var instance;

    before(function(done) {
        browserSync.reset();
        instance = browserSync(
            {
                open: false,
                logLevel: "silent"
            },
            done
        ).instance;
    });

    after(function() {
        instance.cleanup();
    });

    it("should accept an event & broadcast it", function(done) {
        var called;

        instance.io.sockets.on("connection", function(client) {
            if (!called) {
                called = true;
                client.on("scroll", function() {
                    done();
                });
            }
        });
        var options = instance.options.toJS();

        var connectionUrl = options.urls.local + options.socket.namespace;
        var client1 = socket(connectionUrl, {
            path: options.socket.path,
            forceNew: true
        });

        client1.emit("scroll", { name: "shane" });
    });
});
