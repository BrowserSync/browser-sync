var browserSync = require("../../../../");
var connect = require("connect");
var assert = require("chai").assert;
var socket = require("socket.io");
var client = require("socket.io-client");

describe("E2E proxy + Web sockets test", function() {
    var instance, server, options;

    before(function(done) {
        browserSync.reset();

        var app = connect();
        server = app.listen();
        var proxytarget = "http://localhost:" + server.address().port;

        var config = {
            proxy: {
                target: proxytarget,
                ws: true
            },
            logLevel: "silent",
            open: false
        };

        instance = browserSync.init([], config, function(err, bs) {
            options = bs.options;
            done();
        }).instance;
    });

    after(function() {
        instance.cleanup();
        server.close();
    });

    it("can init proxy & serve a page", function(done) {
        assert.equal(instance.options.getIn(["proxy", "ws"]), true);

        socket(server);

        server.on("upgrade", function() {
            done();
        });

        client.connect(instance.options.getIn(["urls", "local"]), {
            forceNew: true
        });
    });
});
