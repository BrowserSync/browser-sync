"use strict";

var defaultConfig = require("../../../lib/default-config");
var messages      = require("../../../lib/messages");
var utils         = require("../../../lib/utils").utils;
var BrowserSync   = require("../../../lib/browser-sync");
var browserSync   = new BrowserSync();
browserSync.cwd   = "/Users/shakshane/app";

var assert = require("chai").assert;
var sinon = require("sinon");

var options = browserSync.options;

describe("Exposed Methods", function () {

    var emitter, emitterStub;
    before(function () {
        emitter = browserSync.events;
        emitterStub = sinon.stub(emitter, "emit");
    });
    afterEach(function () {
        emitterStub.reset();
    });
    it("can be loaded", function () {
        assert.isDefined(browserSync);
    });

    describe("logging messages to the console", function () {

        var spy;
        before(function () {
            spy = sinon.spy(console, "log");
        });
        afterEach(function () {
            spy.reset();
        });
        after(function () {
            spy.restore();
        });
        it("should log a message", function () {
            utils.log("ERROR", {debugInfo: true});
            assert.isTrue(spy.called);
        });
        it("should not log if disabled in options", function () {
            utils.log("ERROR", {debugInfo: false});
            assert.isFalse(spy.called);
        });
        it("should log message if disabled in options, but overridden with param", function () {
            utils.log("ERROR", {debugInfo: false}, true);
            assert.isTrue(spy.called);
        });
    });
    describe("changing a file", function () {

        var data;

        beforeEach(function () {
            data = browserSync.changeFile("/app/styles/core.css", defaultConfig);
        });
        it("should return the filename", function () {
            assert.equal(data.assetFileName, "core.css");
        });
        it("should return the fileExtension", function () {
            assert.equal(data.fileExtension, "css");
        });
        it("should emit the event with the correct data", function () {
            sinon.assert.calledWithExactly(emitterStub, "file:reload", {
                assetFileName: "core.css",
                cwd: browserSync.cwd,
                fileExtension: "css",
                path: "/app/styles/core.css",
                type: "inject"
            });
        });

        describe("returning the data sent to client when it's a reload file type", function () {

            var data;
            beforeEach(function () {
                emitterStub.reset();
                data = browserSync.changeFile("/app/index.php", defaultConfig);
            });

            it("should return the filename", function () {
                assert.equal(data.assetFileName, "index.php");
            });
            it("should return the fileExtension", function () {
                assert.equal(data.fileExtension, "php");
            });

            it("should emit the event with the correct data", function () {

                sinon.assert.calledWithExactly(emitterStub, "file:reload", {
                    url: "/app/index.php",
                    assetFileName: "index.php",
                    fileExtension: "php",
                    type: "reload",
                    path: "/app/index.php",
                    cwd: browserSync.cwd
                });
            });
        });
    });
});
