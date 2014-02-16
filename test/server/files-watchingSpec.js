var fs = require("fs");
var bs = require("../../lib/browser-sync");
var messages = require("../../lib/messages");
var fileWatcher = require("../../lib/file-watcher");
var events = require("events");
var browserSync = new bs();
var options = bs.options;
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
        var files = ["*.rb"];
        var msgStub;
        var emitter, eventSpy;
        before(function () {
            watchCallback = sinon.spy(fileWatcher, "getWatchCallback");
            msgStub = sinon.stub(messages.files, "watching").returns("MESSAGE");
        });
    });

    describe("Watching files with a Timeout", function () {

        var changeCallback;
        var options = {
            fileTimeout: 10
        };
        var changedFile = testFile1;
        var fsStub;
        var emitter;
        var emitSpy;

        before(function () {
            emitter = new events.EventEmitter();
            changeCallback = sinon.spy(fileWatcher.getChangeCallback(options, emitter));
            fsStub = sinon.stub(fs, "statSync");
            emitSpy = sinon.spy(emitter, "emit");
        });

        afterEach(function () {
            emitSpy.reset();
            changeCallback.reset();
            fsStub.reset();
        });

        after(function () {
            fsStub.restore();
        });

        it("can call the callback when a file has changed! with > 0 bytes", function () {

            fsStub.returns({size: 300});
            clock.tick(20);
            changeCallback(changedFile);
            clock.tick();
            sinon.assert.calledWithExactly(emitSpy, "file:changed", {path: changedFile});
        });
        it("does not call the callback if 0 bytes", function () {

            fsStub.returns({size: 0});
            clock.tick();
            changeCallback(changedFile);
            sinon.assert.notCalled(emitSpy);
        });
        it("should call the callback if 0 bytes first, then > 0 bytes on second call", function () {

            fsStub.returns({size: 0});
            clock.tick();
            changeCallback(changedFile);
            fsStub.returns({size: 300});
            clock.tick(20);
            changeCallback(changedFile);
            clock.tick();
            sinon.assert.calledWithExactly(emitSpy, "file:changed", {path: changedFile});
        });
    });

    describe("Watching files with a delay", function () {

        var changeCallback = testFile1;
        var options = {
            fileTimeout: 0,
            reloadDelay: 1000
        };
        var changedFile;
        var fsStub;
        var emitter;
        var emitSpy;
        var clock;

        before(function () {
            emitter = new events.EventEmitter();
            clock = sinon.useFakeTimers();
            changeCallback = sinon.spy(fileWatcher.getChangeCallback(options, emitter));
            fsStub = sinon.stub(fs, "statSync");
            fsStub.returns({size: 300});
            emitSpy = sinon.spy(emitter, "emit");
        });

        afterEach(function () {
            emitSpy.reset();
            changeCallback.reset();
            fsStub.reset();
        });

        after(function () {
            fsStub.restore();
        });

        it("not call the callback straight away if delay in options", function () {
            clock.tick(900);
            changeCallback(changedFile);
            sinon.assert.notCalled(emitSpy);
        });
        it("not call the callback straight away if delay in options", function () {
            clock.tick(300);
            changeCallback(changedFile);
            sinon.assert.notCalled(emitSpy);
        });
        it("not call the callback straight away if delay in options (2)", function () {
            clock.tick(1000);
            changeCallback(changedFile);
            sinon.assert.called(emitSpy);
        });
        it("not call the callback straight away if delay in options (3)", function () {
            clock.tick(1200);
            changeCallback(changedFile);
            sinon.assert.called(emitSpy);
        });
    });
});