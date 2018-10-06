var path = require("path");
var assert = require("chai").assert;
var connect = require("connect");
var browserSync = require(path.resolve("./"));
var socket = require("socket.io");
var client = require("socket.io-client");

var pkg = require(path.resolve("package.json"));
var cli = require(path.resolve(pkg.bin)).default;

describe("E2E CLI proxy + websockets test", function() {
    var instance, server;

    before(function(done) {
        browserSync.reset();
        var app = connect();
        server = app.listen();

        var proxytarget = "http://localhost:" + server.address().port;

        cli({
            cli: {
                input: ["start"],
                flags: {
                    proxy: proxytarget,
                    open: false,
                    online: false,
                    logLevel: "silent",
                    ws: true
                }
            },
            cb: function(err, bs) {
                instance = bs;
                done();
            }
        });
    });
    after(function() {
        server.close();
        instance.cleanup();
    });
    it("can proxy websocket upgrades", function(done) {
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
