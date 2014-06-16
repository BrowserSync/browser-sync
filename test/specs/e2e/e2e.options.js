"use strict";

var browserSync = require("../../../lib/index");

var path        = require("path");

var sinon       = require("sinon");
var request     = require("supertest");
var assert      = require("chai").assert;

describe("E2E options test", function () {

    var options;
    var instance;
    var server;

    before(function (done) {
        var config = {
            server: {
                baseDir: __dirname + "/../../fixtures"
            },
            port: 8080,
            debugInfo: false,
            open: false
        };
        browserSync.init(config, function (err, bs) {
            options  = bs.options;
            instance = bs;
            server   = bs.servers.staticServer;
            done();
        });
    });
    after(function () {
        server.close();
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
    var server;

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
            server   = bs.servers.staticServer;
            done();
        });
    });
    after(function () {
        server.close();
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
    var instance, server;

    before(function (done) {
        browserSync.init([], null, function (err, bs) {
            options  = bs.options;
            instance = bs;
            server   = bs.servers.staticServer;
            done();
        });
    });
    after(function () {
        server.close();
    });

    it("Sets the available port", function () {
        var match = /\d{2,5}/.exec(options.port)[0];
        assert.isNotNull(match);
    });
    it("sets the open options to false", function () {
        assert.deepEqual(options.open, false);
    });
});

describe("E2E NO OPTIONS", function () {

    var options;
    var instance;
    var server;

    before(function (done) {
        browserSync.init([], {}, function (err, bs) {
            options  = bs.options;
            instance = bs;
            server   = bs.servers.staticServer;
            done();
        });
    });
    after(function () {
        server.close();
    });

    it("Sets the ghostMode options", function () {
        assert.deepEqual(options.ghostMode.clicks, true);
        assert.deepEqual(options.ghostMode.scroll, true);
        assert.deepEqual(options.ghostMode.forms.submit, true);
        assert.deepEqual(options.ghostMode.forms.inputs, true);
        assert.deepEqual(options.ghostMode.forms.toggles, true);
        assert.deepEqual(options.ghostMode.location, false);
    });
});

describe("E2E GHOST OPTIONS", function () {

    var options;
    var instance;
    var server;

    var config = {
        ghostMode: {
            links: true,
            forms: {
                submit: false
            }
        }
    };

    before(function (done) {
        browserSync.init([], config, function (err, bs) {
            options  = bs.options;
            instance = bs;
            server   = bs.servers.staticServer;
            done();
        });
    });
    after(function () {
        server.close();
    });

    it("Sets the ghostMode options", function () {
        assert.deepEqual(options.ghostMode.links, true);
        assert.deepEqual(options.ghostMode.clicks, true);
        assert.deepEqual(options.ghostMode.scroll, true);
        assert.deepEqual(options.ghostMode.forms.submit, false);
        assert.deepEqual(options.ghostMode.forms.inputs, true);
        assert.deepEqual(options.ghostMode.forms.toggles, true);
        assert.deepEqual(options.ghostMode.location, false);
    });
});

describe("E2E HOST OPTIONS + localhost", function () {

    var options;
    var instance;
    var server;

    var config = {
        host: "localhost",
        debugInfo: false
    };

    before(function (done) {
        browserSync.init(config, function (err, bs) {
            options  = bs.options;
            instance = bs;
            server   = bs.servers.staticServer;
            done();
        });
    });
    after(function () {
        server.close();
    });

    it("Sets the ghostMode options", function () {
        assert.ok(options.port.toString().match(/\d\d\d\d/));
        assert.equal(options.urls.local, "http://localhost:3000");
    });
});
