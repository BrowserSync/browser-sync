"use strict";

var browserSync = require("../../../../index");

var connect = require("connect");

var request = require("supertest");
var assert  = require("chai").assert;

describe("Accepting middleware as an option", function () {

    var bs;

    before(function (done) {

        browserSync.reset();

        var mw =  function (req, res) {
            res.end("<html><body></body></html>");
        };

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            middleware: mw, // single function given
            logLevel: "silent",
            open: false
        };

        bs = browserSync.init(config, done).instance;
    });

    after(function () {
        bs.cleanup();
    });

    it("should accept middlewares when given as top-level", function () {
        assert.equal(bs.options.get("middleware").size, 1);
    });
});

describe("Accepting middleware as an option", function () {

    var bs;

    before(function (done) {

        browserSync.reset();

        var mw1 =  function (req, res) {
            res.end("<html><body></body></html>");
        };
        var mw2 =  function (req, res) {
            res.end("<html><body></body></html>");
        };

        var config = {
            server: {
                baseDir: "test/fixtures"
            },
            middleware: [mw1, mw2], // single function given
            logLevel: "silent",
            open: false
        };

        bs = browserSync.init(config, done).instance;
    });

    after(function () {
        bs.cleanup();
    });

    it("should accept middlewares when given as top-level", function () {
        assert.equal(bs.options.get("middleware").size, 2);
    });
});