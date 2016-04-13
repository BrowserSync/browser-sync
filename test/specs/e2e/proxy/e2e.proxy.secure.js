"use strict";

var browserSync = require("../../../../index");
var testUtils = require("../../../protractor/utils");
var Immutable = require("immutable");
var request = require("supertest");
var assert = require("chai").assert;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

describe("E2E TLS proxy test", function () {

    this.timeout(15000);

    var bs, app;

    before(function (done) {

        browserSync.reset();

        app = testUtils.getApp(Immutable.Map({scheme: "https"}));

        app.server.listen();

        var config = {
            proxy: "https://localhost:" + app.server.address().port,
            open: false,
            logLevel: "silent"
        };

        bs = browserSync.init(config, done).instance;
    });

    after(function () {
        bs.cleanup();
        app.server.close();
    });

    it("Set's a HTTPS url", function () {
        var local = bs.options.getIn(["urls", "local"]);
        assert.equal("https://localhost:" + bs.options.get("port"), local);
    });

    it("proxies over https and injects snippet", function (done) {

        assert.isString(bs.options.get("snippet"));

        var expected = app.html.replace("BS", bs.options.get("snippet") + "BS");

        request(bs.options.getIn(["urls", "local"]))
            .get("/index.html")
            .set("accept", "text/html")
            .expect(200, expected, done);
    });
});

describe("E2E TLS proxy Options test", function () {

    this.timeout(15000);

    var app;

    before(function () {

        browserSync.reset();

        app = testUtils.getApp(Immutable.Map({scheme: "https"}));

        app.server.listen();
    });

    after(function () {
        app.server.close();
    });

    it("Exits if https specified in options, but not in target", function (done) {
        var utils = require("../../../../lib/utils");
        var errors = require("../../../../lib/config").errors;
        var sinon = require("sinon");
        var config = {
            proxy: "http://localhost:" + app.server.address().port,
            https: true,
            open: false,
            logLevel: "silent"
        };
        var stub = sinon.stub(utils, "fail");
        browserSync.init(config);
        sinon.assert.called(stub);
        assert.include(stub.getCall(0).args[1], errors["proxy+https"]);
        utils.fail.restore();
        done();
    });
});
