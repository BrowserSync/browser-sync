var browserSync = require("../../../");

var request = require("supertest");
var http = require("http");
var connect = require("connect");
var assert = require("chai").assert;

describe("Plugins: Using the connector middleware:", function() {
    it("returns middleware for the connector script", function(done) {
        browserSync.reset();

        var instance;

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            logLevel: "silent",
            open: false
        };

        browserSync.use({
            plugin: function(opts, bs) {
                var connectorMw = bs.getMiddleware("connector");

                var app = connect();

                app.use("/shane", connectorMw);

                var server = http.createServer(app);

                request(server)
                    .get("/shane")
                    .expect(200)
                    .end(function(err, res) {
                        assert.include(
                            res.text,
                            "window.___browserSync___ = {};"
                        );
                        instance.cleanup(done);
                    });
            }
        });

        instance = browserSync(config);
    });
});

describe("Plugins: Using the connector middleware:", function() {
    it("returns middleware for the connector script using custom Namespace", function(done) {
        browserSync.reset();

        var instance;

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            logLevel: "silent",
            open: false
        };

        browserSync.use({
            plugin: function(opts, bs) {
                var connectorMw = bs.getSocketConnector({
                    path: bs.options.getIn(["socket", "path"]),
                    namespace: "/browser-sync-cp"
                });

                var app = connect();

                app.use("/shane", connectorMw);

                var server = http.createServer(app);

                request(server)
                    .get("/shane")
                    .expect(200)
                    .end(function(err, res) {
                        assert.include(res.text, "/browser-sync-cp");
                        instance.cleanup(done);
                    });
            }
        });

        instance = browserSync(config);
    });
});

describe("Plugins: Using the connector as a string", function() {
    it("returns middleware for the connector script as a string", function(done) {
        browserSync.reset();

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            logLevel: "silent",
            open: false
        };

        browserSync.use({
            plugin: function(opts, bs) {
                var connectorString = bs.getExternalSocketConnector({
                    namespace: "/browser-sync-cp"
                });

                assert.include(connectorString, "/browser-sync-cp");
            }
        });

        browserSync(config, function(err, bs) {
            bs.cleanup();
            done();
        });
    });
});
