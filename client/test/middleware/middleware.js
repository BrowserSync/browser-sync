"use strict";

var index       = require("../../index.js");

var assert      = require("chai").assert;
var http        = require("http");
var request     = require("supertest");
var express     = require("express");

describe("Using the middleware", function () {

    var app;
    before(function () {
        app = express();
        app.use("/client", index.middleware({minify: true}, "BEFORE"));
    });

    it("Returns a function", function () {
        assert.isFunction(index.middleware);
    });

    it("should return the JS when no cache", function (done) {
        request(app)
            .get("/client")
            .expect("Content-Type", /text\/javascript/)
            .expect("Cache-Control", "public, max-age=0")
            .expect("ETag", /".*-.*"/)
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(res.text.length > 0);
                assert.isTrue(res.text.indexOf("BEFORE") > -1);
                done();
            });
    });

    it("should return not modified if has cache and fresh", function (done) {
        var etag = null;
        request(app)
            .get("/client")
            .end(function (err, res) {
                etag = res.headers["ETag"];
            });

        request(app)
            .get("/client")
            .set("If-None-Match", etag)
            .expect("Cache-Control", "public, max-age=0")
            .expect("ETag", /".*-.*"/)
            .expect(304)
            .end(function (err, res) {
                assert.isUndefined(res.headers["Content-Type"]);
                done();
            });
    });

    it("should return the JS if has cache and not fresh", function (done) {
        request(app)
            .get("/client")
            .set("If-None-Match", "Different-ETag")
            .expect("Content-Type", /text\/javascript/)
            .expect("Cache-Control", "public, max-age=0")
            .expect("ETag", /".*-.*"/)
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(res.text.length > 0);
                assert.isTrue(res.text.indexOf("BEFORE") > -1);
                done();
            });
    });

    it("should return a gzipped response when supported", function (done) {
        request(app)
            .get("/client")
            .set("Accept-Encoding", "gzip, deflate")
            .expect("Content-Encoding", "gzip")
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(res.text.indexOf("BEFORE") > -1);
                done();
            });
    });

    it("Should return a non-gzipped response when not supported", function (done) {
        request(app)
            .get("/client")
            .set("Accept-Encoding", "deflate")
            .expect(200)
            .end(function (err, res) {
                assert.isTrue(res.text.indexOf("BEFORE") > -1);
                done();
            });
    });
});