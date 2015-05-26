"use strict";

var browserSync = require("../../../");
var fileWatcher = require("../../../lib/file-watcher");
var hooks       = require("../../../lib/hooks");
var merge       = require("../../../lib/cli/cli-options").merge;

var events      = require("events");
var path        = require("path");
var sinon       = require("sinon");
var assert      = require("chai").assert;

var outpath = path.join(__dirname, "../../fixtures");

describe("File Watcher Module", function () {

    it("Passes options for chokidar", function () {
        var imm = merge({
            files: "css/*.css",
            watchOptions: {
                debounceDelay: 4000
            }
        });
        imm = imm.set("files", hooks["files:watch"]([], imm.get("files"), {}));

        var emitter = new events.EventEmitter();
        var watchers = fileWatcher.plugin({options: imm, emitter: emitter});

        assert.equal(watchers.core.watchers.length, 1);
        assert.equal(watchers.core.watchers[0].options.debounceDelay, 4000);
    });
    it("Passes separate options for chokidar when multi given", function () {
        var imm = merge({
            files: [
                "css/*.css",
                {
                    match: "*.html",
                    fn: function (event) {
                        console.log(event);
                    },
                    options: {
                        interval: 100
                    }
                }
            ],
            watchOptions: {
                interval: 200
            }
        });
        imm = imm.set("files", hooks["files:watch"]([], imm.get("files"), {}));

        var emitter = new events.EventEmitter();
        var watchers = fileWatcher.plugin({options: imm, emitter: emitter});

        assert.equal(watchers.core.watchers.length, 2);
        assert.equal(watchers.core.watchers[0].options.interval, 200);
        assert.equal(watchers.core.watchers[1].options.interval, 100);
    });
    it("should emit events about changed files in core namespace", function (done) {

        var tempFile = path.join(outpath, "watch-func.txt");
        var called = false;

        // assert: it works if it calls done
        var bs = browserSync.create();

        bs.init({
            files: [
                {
                    options: {
                        ignoreInitial: true
                    },
                    match: tempFile,
                    fn: function (event, file) {
                        assert.equal(event, "change");
                        assert.equal(file, tempFile);
                        assert.isFunction(this.reload);
                        assert.isFunction(this.notify);
                        bs.cleanup();
                        if (!called) {
                            done();
                            called = true;
                        }
                    }
                }
            ],
            ui: false,
            online: false,
            logSnippet: false,
            logLevel: "silent"
        }, function (err, bs) {
            bs.watchers.core.watchers[0]._events.all("change", tempFile);
        });
    });
    it("should allow obj literal with match & options, but without callback fn", function (done) {

        var tempFile = path.join(outpath, "watch-func.txt");

        // assert: it works if it calls done
        var bs = browserSync.create();

        bs.init({
            files: [
                {
                    options: {
                        ignoreInitial: true
                    },
                    match: tempFile
                }
            ],
            ui: false,
            online: false,
            logSnippet: false,
            logLevel: "silent"
        }, function (err, bs) {

            var spy = sinon.spy(bs.events, "emit");

            bs.watchers.core.watchers[0]._events.all("change", tempFile);

            var callArgs = spy.getCall(0).args;

            assert.equal(callArgs[0], "file:changed");
            assert.equal(callArgs[1].basename, "watch-func.txt");
            assert.equal(callArgs[1].event, "change");
            assert.equal(callArgs[1].namespace, "core");

            bs.cleanup();

            done();
        });
    });
});
