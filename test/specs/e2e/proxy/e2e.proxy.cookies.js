"use strict";

var browserSync     = require("../../../../index");
var testUtils       = require("../../../protractor/utils");
var Immutable       = require("immutable");
var request         = require("supertest");
var assert          = require("chai").assert;
var foxyPath        = require.resolve("foxy");
var foxy            = require(foxyPath); // jshint ignore:line

describe("E2E proxy test with custom cookies options passed to foxy", function () {

    this.timeout(15000);

    var bs, app, spy;

    before(function (done) {

        browserSync.reset();

        app = testUtils.getApp(Immutable.Map({scheme: "https"}));

        app.server.listen();

        var config = {
            proxy: {
                target: "https://localhost:" + app.server.address().port,
                cookies: {
                    stripDomain: false
                }
            },
            open: false,
            logLevel: "silent"
        };

        spy = require("sinon").spy(require.cache[foxyPath], "exports");
        bs = browserSync.init(config, done).instance;
    });

    after(function () {
        bs.cleanup();
        app.server.close();
    });

    it("sets cookie stripDomain: false", function (done) {

        assert.isFalse(spy.getCall(0).args[1].cookies.stripDomain); // check fn passed to foxy

        spy.restore();

        var expected = app.html.replace("BS", bs.options.get("snippet") + "BS");

        request(bs.options.getIn(["urls", "local"]))
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200, expected, done);
    });
});
