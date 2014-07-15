"use strict";

var fileWatcher = require("../../../lib/file-watcher");

var events      = require("events");
var path        = require("path");
var _           = require("lodash");
var fs          = require("graceful-fs");
var assert      = require("chai").assert;
var sinon       = require("sinon");

var outpath = path.join(__dirname, "/../../fixtures");

var tempFileContent = "A test generated this file and it is safe to delete";

var writeTimeout = 125; // Wait for it to get to the filesystem

var writeFileWait = function(name, content, cb) {
    if (!cb) {
        cb = function() {};
    }
    setTimeout(function() {
        fs.writeFile(name, content, cb);
    }, writeTimeout);
};

describe("File Watcher Module", function () {

    it("accepts options for Gaze", function (done) {
        var arg = {
            "shane": __dirname + "/../../fixtures/test.txt"
        };
        var options = { // Gaze options
            watchOptions: {
                debounceDelay: 4000
            }
        };
        var emitter = new events.EventEmitter();

        var watchers = fileWatcher.plugin(arg, options, emitter);

        watchers.shane.watcher._watcher.on("ready", function () { // dig down to find Gaze instance
            assert.equal(this.options.debounceDelay, 4000);
            done();
        });
    });

    it("should emit events about changed files", function (done) {

        var tempFile = path.join(outpath, "watch-func.txt");

        var arg = {
            "shane": tempFile
        };

        var emitter = new events.EventEmitter();

        fs.writeFile(tempFile, tempFileContent, function() {

            // assert: it works if it calls done
            fileWatcher.plugin(arg, {}, emitter);

            emitter.on("file:changed", function (data) {
                assert.equal(data.namespace, "shane");
                assert.equal(data.type, "changed");
                assert.equal(data.path, path.resolve(tempFile));
                done();
            });

            // act: change file
            writeFileWait(tempFile, tempFileContent+" changed");
        });
    });
});