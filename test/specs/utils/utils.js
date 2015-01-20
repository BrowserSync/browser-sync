"use strict";

var merge  = require("../../../lib/cli/cli-options").merge;
var BrowserSync   = require("../../../lib/browser-sync");
var events = require("events");
var emitter = new events.EventEmitter();
var browserSync   = new BrowserSync(emitter);
browserSync.cwd   = "/Users/shakshane/app";

var assert = require("chai").assert;
var sinon = require("sinon");

describe("Utils: Exposed Methods", function () {

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

    describe("changing a file", function () {

        var data;

        beforeEach(function () {
            data = browserSync.changeFile({path:"/app/styles/core.css", log: true}, merge({}));
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
                type: "inject",
                log: true
            });
        });

        describe("returning the data sent to client when it's a reload file type", function () {

            var data;
            beforeEach(function () {
                emitterStub.reset();
                data = browserSync.changeFile({path:"/app/index.php", log:true}, merge({}));
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
                    cwd: browserSync.cwd,
                    log: true
                });
            });
        });
    });
});
