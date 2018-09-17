var browserSync = require("../../../");

var assert = require("chai").assert;
var request = require("supertest");
var http = require("http");
var path = require("path");
var connect = require("connect");
var serveStatic = require("serve-static");

describe("Plugins: Should be able to call `serveFile` on the instance when in server mode", function() {
    var PLUGIN_NAME = "KITTENZ";
    it("should serve the file", function(done) {
        browserSync.reset();

        var config = {
            logLevel: "silent",
            open: false,
            server: "test/fixtures"
        };

        browserSync.use({
            plugin: function(opts, bs) {
                bs.serveFile("/shane", {
                    type: "text/css",
                    content: "Hi there"
                });
            },
            "plugin:name": PLUGIN_NAME
        });

        browserSync(config, function(err, bs) {
            request(bs.server)
                .get("/shane")
                .set("accept", "text/html")
                .expect(200)
                .end(function(err, res) {
                    assert.include(res.text, "Hi there");
                    assert.equal(res.headers["content-type"], "text/css");
                    bs.cleanup();
                    done();
                });
        });
    });
});

describe("Plugins: Should be able to call `serveFile` on the instance when in snippet mode", function() {
    var PLUGIN_NAME = "KITTENZ";
    it("should serve the file", function(done) {
        browserSync.reset();

        var config = {
            logLevel: "silent",
            open: false
        };

        browserSync.use({
            plugin: function(opts, bs) {
                bs.serveFile("/shane", {
                    type: "text/css",
                    content: "Hi there"
                });
            },
            "plugin:name": PLUGIN_NAME
        });

        browserSync(config, function(err, bs) {
            request(bs.server)
                .get("/shane")
                .set("accept", "text/html")
                .expect(200)
                .end(function(err, res) {
                    assert.include(res.text, "Hi there");
                    assert.equal(res.headers["content-type"], "text/css");
                    bs.cleanup();
                    done();
                });
        });
    });
});

describe("Plugins: Should be able to call `serveFile` on the instance when in proxy mode", function() {
    var PLUGIN_NAME = "KITTENZ";

    it("should serve the file + browserSync file", function(done) {
        browserSync.reset();

        var testApp = connect().use(
            serveStatic(path.join(__dirname, "../../fixtures"))
        );

        // server to proxy
        var stubServer = http.createServer(testApp).listen();
        var port = stubServer.address().port;

        var config = {
            logLevel: "silent",
            open: false,
            proxy: "http://localhost:" + port
        };

        browserSync.use({
            plugin: function(opts, bs) {
                bs.serveFile("/shane", {
                    type: "text/css",
                    content: "Hi there"
                });
            },
            "plugin:name": PLUGIN_NAME
        });

        browserSync(config, function(err, bs) {
            request(bs.server)
                .get("/shane")
                .set("accept", "text/html")
                .expect(200)
                .end(function(err, res) {
                    assert.include(res.text, "Hi there");
                    assert.equal(res.headers["content-type"], "text/css");
                    stubServer.close();
                    bs.cleanup();
                    done();
                });
        });
    });
});
