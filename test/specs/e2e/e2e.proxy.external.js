"use strict";

var browserSync = require("../../../index");

var http        = require("http");
var connect     = require("connect");
var request     = require("supertest");
var assert      = require("chai").assert;
var client      = require("socket.io-client");

describe.only("E2E proxy test external", function () {

    var instance, stubServer;

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

        assert.isString(instance.options.snippet);
        assert.isDefined(instance.server);

        request(instance.server)
            .get("/")
            .set("accept", "text/html")
            .expect(200)
            .end(function (err, res) {
//                console.log(res.text);
                assert.include(res.text, "browser-sync-client");
                assert.include(res.text, "http://192.168.0.2:3000/about");
                done();
            });
    });
});
