var bs = require("../../lib/browser-sync");
var utils = require("../../lib/utils").utils;
var messages = require("../../lib/messages");
var controlPanel = require("../../lib/control-panel");
var browserSync = new bs();
var assert = require("chai").assert;
var sinon = require("sinon");
var options = browserSync.options;

describe("Exposed Methods", function () {

    var emitter, emitterStub;
    before(function () {
        emitter = browserSync.getEmitter();
        emitterStub = sinon.stub(emitter, "emit");
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
            data = browserSync.changeFile("/app/styles/core.css", options);
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
                fileExtension: "css"
            });
        });

        describe("returning the data sent to client when it's a reload file type", function () {

            var data;
            beforeEach(function () {
                data = browserSync.changeFile("/app/index.php", options);
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
                    fileExtension: "php"
                });
            });
        });

        describe("logging info about the file change to the console", function () {

            it("should log which file is changed", function () {

                var spy = sinon.spy(messages.files, "changed");

                // fake the CWD
                browserSync.cwd = "/Users/shakyshane/browser-sync";

                browserSync.changeFile("/Users/shakyshane/browser-sync/app/css/styles.css", options);

                sinon.assert.calledWithExactly(spy, "app/css/styles.css");

            });

            it("should log the INJECT message when an inject file was changed", function () {
                var spy = sinon.spy(messages.browser, "inject");
                browserSync.changeFile("/app/styles/core.css", options);
                sinon.assert.called(spy);
            });

            it("should log the INJECT message when an inject file was changed", function () {
                var spy = sinon.spy(messages.browser, "reload");
                browserSync.changeFile("/app/styles/core.html", options);
                sinon.assert.called(spy);
            });
        });
    });
});
