"use strict";

var browserSync = require("../../../../index");

var request     = require("supertest");
var assert      = require("chai").assert;

describe.skip("E2E proxy test external", function () {

    var instance;

    before(function (done) {
        instance = browserSync({
            proxy: "homestead.app:8000",
            open: false
        }, done);
    });

    after(function () {
        instance.cleanup();
    });

    it("can init proxy & serve a page", function (done) {

        assert.isString(instance.options.get("snippet"));
        assert.isDefined(instance.server);

        request(instance.server)
            .get("/")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
                assert.include(res.text, "browser-sync-client");
                done();
            });
    });
});
