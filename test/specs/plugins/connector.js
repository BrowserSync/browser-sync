"use strict";

var browserSync = require("../../../index");
var BrowserSync = require("../../../lib/browser-sync");

var request = require("supertest");
var _       = require("lodash");
var http    = require("http");
var connect = require("connect");
var assert  = require("chai").assert;

describe("Plugins: Using the connector middleware:", function () {

    it("returns middleware for the connector script", function (done) {

        var instance;

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            debugInfo: false,
            open: false
        };

        browserSync.use({

            plugin: function (bs, opts) {

                var connectorMw = bs.getMiddleware("connector");
                var app = connect();

                app.use("/shane", connectorMw);

                var server = http.createServer(app);

                request(server)
                    .get("/shane")
                    .expect(200)
                    .end(function (err, res) {
                        assert.isTrue(_.contains(res.text, "var ___socket___"));
                        assert.isTrue(_.contains(res.text, bs.options.port));
                        instance.cleanup(done);
                    });
            }
        });

        instance = browserSync(config);
    });
});