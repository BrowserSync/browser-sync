"use strict";

var browserSync = require("../../../index");

var request = require("supertest");
var _       = require("lodash");
var http    = require("http");
var connect = require("connect");
var assert  = require("chai").assert;

describe("Plugins: Using the connector middleware:", function () {

    it("returns middleware for the connector script", function (done) {

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

            plugin: function (opts, bs) {

                var connectorMw     = bs.getMiddleware("connector");

                var app = connect();

                app.use("/shane", connectorMw);

                var server = http.createServer(app);

                request(server)
                    .get("/shane")
                    .expect(200)
                    .end(function (err, res) {
                        assert.isTrue(_.contains(res.text, "window.___browserSync___ = {};"));
                        instance.cleanup(done);
                    });
            }
        });

        instance = browserSync(config);
    });
});

describe("Plugins: Using the connector middleware:", function () {

    it("returns middleware for the connector script using custom Namespace", function (done) {

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

            plugin: function (opts, bs) {

                var connectorMw = bs.getSocketConnector(bs.options.get("port"), {
                    path: bs.options.getIn(["socket", "path"]),
                    namespace: "/browser-sync-cp"
                });

                var app = connect();

                app.use("/shane", connectorMw);

                var server = http.createServer(app);

                request(server)
                    .get("/shane")
                    .expect(200)
                    .end(function (err, res) {
                        assert.isTrue(_.contains(res.text, "/browser-sync-cp"));
                        instance.cleanup(done);
                    });
            }
        });

        instance = browserSync(config);
    });
});
