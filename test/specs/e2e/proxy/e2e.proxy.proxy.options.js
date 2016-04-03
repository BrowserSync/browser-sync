"use strict";

var browserSync     = require("../../../../index");
var testUtils       = require("../../../protractor/utils");
var Immutable       = require("immutable");
var request         = require("supertest");
var assert          = require("chai").assert;
var foxyPath        = require.resolve("foxy");
var foxy            = require(foxyPath); // jshint ignore:line

describe("E2E proxy test with `proxyOptions`", function () {

    this.timeout(15000);

    var bs, app;

    before(function (done) {

        browserSync.reset();

        app = testUtils.getApp(Immutable.Map({scheme: "https"}));

        app.server.listen();

        var config = {
            proxy: {
                target: "https://localhost:" + app.server.address().port,
                proxyOptions: {
                    xfwd: true
                }
            },
            open: false,
            logLevel: "silent"
        };

        bs = browserSync.init(config, done).instance;
    });

    after(function () {
        bs.cleanup();
        app.server.close();
    });

    it("sets options for node-http-proxy", function (done) {

        var expected = app.html + bs.options.get("snippet");
        var headers;

        app.app.stack.unshift({
            route: "/index.html",
            handle: function (req, res, next) {
                headers = req.headers;
                next();
            }
        });

        request(bs.options.getIn(["urls", "local"]))
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.ok(headers["x-forwarded-for"]);
                assert.ok(headers["x-forwarded-port"]);
                assert.equal(res.text, expected);
                done();
            });
    });
});
