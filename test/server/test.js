var si = require("../../lib/browser-sync");
var assert = require("assert");
var browserSync = new si();
var messages = require("../../lib/messages");
var http = require("http");

var ports = [3001, 3002];

var expectedMatch1 = "<script src='http://0.0.0.0:" + ports[0] + messages.socketIoScript + "'></script>";
var expectedMatch2 = "<script src='http://0.0.0.0:" + ports[1] + messages.clientScript + "'></script>";

describe("Launching a server with snippets", function () {

    var data, servers;

    beforeEach(function(){

        var options = {
            server: {
                baseDir: "test/fixtures",
                injectScripts: true
            }
        };
        servers = browserSync.launchServer("0.0.0.0", ports, options);
    });

    afterEach(function () {
//        servers.clock
    });

    it("should init test", function (done) {
        http.get("http://localhost:" + ports[1] + messages.clientScript, function (res) {
            assert.equal(res.statusCode, 200);
            done();
        });
    });
});

