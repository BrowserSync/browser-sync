"use strict";

var browserSync = require("../../../index");
var BrowserSync = require("../../../lib/browser-sync");

var request = require("supertest");
var _       = require("lodash");
var http    = require("http");
var connect = require("connect");
var assert  = require("chai").assert;

describe("Plugins: Using the Socket.io js file:", function () {

    it("returns middleware for the socket.io js", function (done) {

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

                var connectorMw = bs.getMiddleware("socket-js");
                var app = connect();

                app.use("/socket", connectorMw);

                var server = http.createServer(app);

                request(server)
                    .get("/socket")
                    .expect(200)
                    .end(function (err, res) {
                        assert.equal(res.headers["content-type"], "text/javascript");
                        instance.cleanup(done);
                    });
            }
        });

        instance = browserSync(config);
    });
});