"use strict";

var browserSync = require("../../../lib/index");

var path    = require("path");

var sinon   = require("sinon");
var request = require("supertest");
var assert  = require("chai").assert;

describe("E2E options test", function () {

    var options;
    var instance;

    before(function (done) {
        var config = {
            server: {
                baseDir: __dirname + "/../../fixtures"
            },
            port: 8080,
            debugInfo: false,
            open: false
        };
        browserSync.init([], config, function (err, bs) {
            options  = bs.options;
            instance = bs;
            done();
        });
    });

    it("Sets the available port", function () {
        var match = /\d{2,5}/.exec(options.port)[0];
        assert.isNotNull(match);
    });
    it("Uses the given port the available port", function () {
        var match = /\d{2,5}/.exec(options.port)[0];
        assert.equal(match, 8080);
    });
});

describe("E2E options test", function () {

    var options;
    var instance;

    before(function (done) {
        var config = {
            server: {
                baseDir: __dirname + "/../../fixtures"
            },
            files: ["*.html"],
            ports: {
                min: 3500
            },
            debugInfo: false,
            open: false
        };
        browserSync.init([], config, function (err, bs) {
            options  = bs.options;
            instance = bs;
            done();
        });
    });

    it("Sets the available port", function () {
        var match = /\d{2,5}/.exec(options.port)[0];
        assert.isNotNull(match);
    });
    it("Uses the given port the available port", function () {
        var match = /\d{2,5}/.exec(options.port)[0];
        assert.equal(match, 3500);
    });
    it("set's the files option", function () {
        assert.deepEqual(options.files, ["*.html"]);
    });
});

describe("E2E NO OPTIONS test with snippet", function () {

    var options;
    var instance;

    before(function (done) {
        browserSync.init([], null, function (err, bs) {
            options  = bs.options;
            instance = bs;
            done();
        });
    });

    it("Sets the available port", function () {
        var match = /\d{2,5}/.exec(options.port)[0];
        assert.isNotNull(match);
    });
    it("sets the open options to false", function () {
        assert.deepEqual(options.open, false);
    });
});
