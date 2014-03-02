"use strict";

var fs = require("fs");
var messages = require("./messages");
var Gaze = require("gaze").Gaze;


module.exports = {
    /**
     * Handle changed files
     * @param {Object} options
     * @param {EventEmitter} emitter
     * @returns {Function}
     */
    getChangeCallback: function (options, emitter) {
        return function (filepath) {
            var stream = fs.createReadStream(filepath);
            var chunks = [];
            stream.on("data", function (chunk) {
                chunks.push(chunk);
            });
            stream.on("end", function () {
                if (chunks.join("").length > 0) {
                    setTimeout(function () {
                        emitter.emit("file:changed", {path: filepath});
                    }, options.reloadDelay || 0);
                }
            });
        };
    },
    /**
     * Function to be called when watching begins
     * @param {Object} options
     * @param {EventEmitter} emitter
     * @returns {Function}
     */
    getWatchCallback: function (options, emitter) {

        return function (watcher) {
            var key = Object.keys(watcher.watched())[0];

            if (key) {
                emitter.emit("log", {msg: messages.files.watching(watcher._patterns), override: true});
            } else {
                emitter.emit("log", {msg: messages.files.watching(), override: true});
            }
        };
    },
    /**
     * Get an instance of Gaze
     * @param {Array} files
     * @returns {Gaze}
     */
    getWatcher: function (files) {
        return new Gaze(files);
    },
    /**
     * @param {Array} files
     * @param {Object} options
     * @param {EventEmitter} emitter
     */
    init: function (files, options, emitter) {

        var watchCallback = this.getWatchCallback(options, emitter);
        var changeCallback = this.getChangeCallback(options, emitter);

        var watcher = this.getWatcher(files);

        watcher.on("ready", watchCallback);
        watcher.on("changed", changeCallback);
    }
};