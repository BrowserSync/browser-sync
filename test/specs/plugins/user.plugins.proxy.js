"use strict";

var browserSync = require("../../../");
var testUtils   = require("../../protractor/utils");
var Immutable   = require("immutable");
var sinon       = require("sinon");
var request     = require("supertest");

describe("Plugins: Should be able to register middleware when in proxy mode", function () {

    var bs;
    var app;
    var spy;

    before(function (done) {

        browserSync.reset();

        app = testUtils.getApp(Immutable.Map({scheme: "http"}));
        app.server.listen();

        spy = sinon.spy();

        var config = {
            proxy: "http://localhost:" + app.server.address().port,
            open: false,
            logLevel: "silent"
        };

        browserSync.use({
            "plugin": function () {
                /* noop */
            },
            "hooks": {
                "server:middleware": function () {
                    return function (req, res, next) {
                        spy();
                        next();
                    };
                }
            },
            "plugin:name": "KITTENZ"
        });

        bs = browserSync(config, done).instance;
    });

    after(function () {
        bs.cleanup();
    });
    it("should serve the file", function (done) {
        request(bs.server)
            .get("/")
            .set("accept", "text/html")
            .end(function () {
                sinon.assert.calledOnce(spy);
                done();
            });
    });
});
