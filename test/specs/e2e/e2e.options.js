"use strict";

var browserSync = require("../../../index");

var assert      = require("chai").assert;
var sinon       = require("sinon");
var portScanner = require("portscanner-plus");

describe("E2E options test", function () {

    var instance, port;

    before(function (done) {

        portScanner.getPorts(1).then(function (ports) {

            port = ports[0];

            var config = {
                server: {
                    baseDir: "test/fixtures"
                },
                port: port,
                debugInfo: false,
                open: false
            };
            instance = browserSync(config, done);
        });
    });
    after(function () {
        instance.cleanup();
    });

    it("Sets the available port", function () {
        var match = /\d{2,5}/.exec(instance.options.port)[0];
        assert.isNotNull(match);
    });
    it("Uses the given port the available port", function () {
        var match = /\d{2,5}/.exec(instance.options.port)[0];
        assert.equal(match, port);
    });
});
//
//describe("E2E options test", function () {
//
//    var instance;
//
//    before(function (done) {
//
//        var config = {
//            server: {
//                baseDir: "test/fixtures"
//            },
//            files: ["*.html"],
//            ports: {
//                min: 3500
//            },
//            debugInfo: false,
//            open: false
//        };
//
//        instance = browserSync.init([], config, done);
//    });
//
//    after(function () {
//        instance.cleanup();
//    });
//
//    it("Sets the available port", function () {
//        var match = /\d{2,5}/.exec(instance.options.port)[0];
//        assert.isNotNull(match);
//    });
//    it("Uses the given port the available port", function () {
//        var match = /\d{2,5}/.exec(instance.options.port)[0];
//        assert.equal(match, 3500);
//    });
//    it("set's the files option", function () {
//        assert.deepEqual(instance.options.files, ["*.html"]);
//    });
//});
//
//describe("E2E NO OPTIONS test with snippet", function () {
//
//    var instance;
//    var stub;
//
//    before(function (done) {
//        stub = sinon.stub(console, "log");
//        instance = browserSync.init([], null, done);
//    });
//
//    after(function () {
//        instance.cleanup();
//        stub.restore();
//    });
//
//    it("Sets the available port", function () {
//        var match = /\d{2,5}/.exec(instance.options.port)[0];
//        assert.isNotNull(match);
//    });
//    it("sets the open options to false", function () {
//        assert.deepEqual(instance.options.open, false);
//    });
//});
//
//describe("E2E NO OPTIONS", function () {
//
//    var instance;
//
//    before(function (done) {
//        instance = browserSync.init([], {debugInfo: false}, done);
//    });
//
//    after(function () {
//        instance.cleanup();
//    });
//
//    it("Sets the ghostMode options", function () {
//
//        var ghostMode = instance.options.ghostMode;
//
//        assert.deepEqual(ghostMode.clicks, true);
//        assert.deepEqual(ghostMode.scroll, true);
//        assert.deepEqual(ghostMode.forms.submit, true);
//        assert.deepEqual(ghostMode.forms.inputs, true);
//        assert.deepEqual(ghostMode.forms.toggles, true);
//        assert.deepEqual(ghostMode.location, false);
//    });
//});
//
//describe("E2E GHOST OPTIONS", function () {
//
//    var instance;
//
//    var config = {
//        ghostMode: {
//            links: true,
//            forms: {
//                submit: false
//            }
//        },
//        debugInfo: false
//    };
//
//    before(function (done) {
//        instance = browserSync.init([], config, done);
//    });
//
//    after(function () {
//        instance.cleanup();
//    });
//
//    it("Sets the ghostMode options", function () {
//
//        var ghostMode = instance.options.ghostMode;
//
//        assert.deepEqual(ghostMode.links, true);
//        assert.deepEqual(ghostMode.clicks, true);
//        assert.deepEqual(ghostMode.scroll, true);
//        assert.deepEqual(ghostMode.forms.submit, false);
//        assert.deepEqual(ghostMode.forms.inputs, true);
//        assert.deepEqual(ghostMode.forms.toggles, true);
//        assert.deepEqual(ghostMode.location, false);
//    });
//});
//
//describe("E2E HOST OPTIONS + localhost", function () {
//
//    var instance;
//
//    var config = {
//        host: "localhost",
//        debugInfo: false
//    };
//
//    before(function (done) {
//        instance = browserSync.init(config, done);
//    });
//
//    after(function () {
//        instance.cleanup();
//    });
//
//    it("Sets the ghostMode options", function () {
//        assert.ok(instance.options.port.toString().match(/\d\d\d\d/));
//        assert.ok(instance.options.urls.local.match(/\d{4,5}$/));
//    });
//});
//
//describe("E2E OLD API FILES OPTION", function () {
//
//    var instance;
//
//    var config = {
//        host: "localhost",
//        online: false,
//        debugInfo: false
//    };
//
//    before(function (done) {
//        instance = browserSync.init(["*.html"], config, done);
//    });
//
//    after(function () {
//        instance.cleanup();
//    });
//
//    it("Sets the files option with the old API", function () {
//        assert.deepEqual(instance.options.files, ["*.html"]);
//    });
//});
