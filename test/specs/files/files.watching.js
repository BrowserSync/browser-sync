var fs = require("fs");
var messages = require("../../../lib/messages");
var fileWatcher = require("../../../lib/file-watcher");
var events = require("events");
var Gaze = require("gaze").Gaze;
var assert = require("chai").assert;
var sinon = require("sinon");

var testFile1 = "test/fixtures/test.txt";
var testFile2 = "test/fixtures/test2.txt";

describe("File Watcher Module", function () {

    var clock;
    before(function () {
        clock = sinon.useFakeTimers();
    });
    after(function () {
        clock.restore();
    });

    describe("INIT stuff", function () {

        it("change callback should be a function", function () {
            assert.isFunction(fileWatcher.getChangeCallback());
        });
        it("watch callback should be a function", function () {
            assert.isFunction(fileWatcher.getWatchCallback());
        });
        describe("returning a watching instance", function () {
            it("should return a watcher instance", function () {
                var actual = fileWatcher.getWatcher();
                assert.instanceOf(actual, Gaze);
            });
            it("should accept an array of patterns (1)", function () {
                var watcher = fileWatcher.getWatcher([testFile1]);
                assert.equal(watcher._patterns.length, 1);
            });
            it("should accept an array of patterns (2)", function () {
                var watcher = fileWatcher.getWatcher([testFile1, testFile2]);
                assert.equal(watcher._patterns.length, 2);
            });
        });
    });


    describe("Watching files init", function () {

        var files = [testFile1, testFile2];
        var msgStub;
        var emitter;
        var eventSpy;

        before(function () {
            emitter = new events.EventEmitter();
            msgStub = sinon.stub(messages.files, "watching").returns("MESSAGE");
            eventSpy = sinon.spy(emitter, "emit");
        });

        beforeEach(function () {
            fileWatcher.init(files, {}, emitter);
        });

        afterEach(function () {
            msgStub.reset();
            eventSpy.reset();
        });

        after(function () {
            msgStub.restore();
        });
        it("should call the watch callback when watching has started", function () {
            clock.tick(300);
            sinon.assert.called(eventSpy);
        });
        it("should call messages.files.watching with the patterns", function () {
            clock.tick(300);
            sinon.assert.calledWithExactly(msgStub, files);
        });
        it("should log when the patterns when watching has started", function () {
            clock.tick(300);
            sinon.assert.calledWithExactly(eventSpy, "log", {msg: "MESSAGE", override: true});
        });
    });

    describe("Watching files init (when none found)", function () {

        var watchCallback;
        var msgStub;
        before(function () {
            watchCallback = sinon.spy(fileWatcher, "getWatchCallback");
            msgStub = sinon.stub(messages.files, "watching").returns("MESSAGE");
        });
    });
});