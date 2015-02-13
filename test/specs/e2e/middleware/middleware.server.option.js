"use strict";

var browserSync = require("../../../../index");

var connect = require("connect");

var request = require("supertest");
var assert  = require("chai").assert;

describe("Accepting middleware as a proxy option", function () {

    var bs;

    before(function (done) {

        browserSync.reset();

        var fn = function (req, res, next) {
            console.log(req.url);
        };

        var config = {
            proxy: {
                target: "http://www.bbc.co.uk",
                middleware: fn // Back compat
            },
            logLevel: "silent",
            open: false
        };

        bs = browserSync.init(config, done).instance;
    });

    after(function () {
        bs.cleanup();
    });

    it("serves files from the middleware with snippet added", function () {
        assert.equal(bs.options.get("middleware").size, 1);
    });
});
//describe("Ignoring middleware as a server option when given at top level", function () {
//
//    var bs;
//
//    before(function (done) {
//
//        browserSync.reset();
//
//        var fn = function fn(req, res, next) {
//            console.log(req.url);
//        };
//        var fn2 = function fn2(req, res, next) {
//            console.log(req.url);
//        };
//
//        var config = {
//            server: {
//                baseDir: "test/fixtures",
//                middleware: fn // Back compat
//            },
//            middleware: fn2,
//            logLevel: "silent",
//            open: false
//        };
//
//        bs = browserSync.init(config, done).instance;
//    });
//
//    after(function () {
//        bs.cleanup();
//    });
//
//    it("serves files from the middleware with snippet added", function () {
//        assert.equal(bs.options.get("middleware").get(0).name, "fn2");
//        assert.equal(bs.options.get("middleware").size, 1);
//    });
//});
