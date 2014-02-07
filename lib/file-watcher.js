"use strict";

var fs = require("fs");
var messages = require("./messages");
var Gaze = require("gaze").Gaze;


module.exports = {
    /**
     * Handle changed files
     * @param {Object} options
     * @returns {Function}
     */
    getChangeCallback: function (options, emitter) {

        var lastInjected = {
            time: new Date().getTime()
        };

        return function (filepath) {

            var stats = fs.statSync(filepath);

            var emitEvent = function () {
                emitter.emit("file:changed", {path: filepath});
            };

            if (stats.size === 0) {
                var count = 0;
                var writeCheck = setInterval(function () {

                    if (count > 4000) {
                        clearInterval(writeCheck);
                        return;
                    }
                    count += 200;

                    if (fs.statSync(filepath).size > 0) {

                        lastInjected.time = new Date().getTime();
                        lastInjected.file = filepath;

                        emitEvent();
                        clearInterval(writeCheck);
                    }
                }, 200);
            } else {

                if (new Date().getTime() > lastInjected.time + (options.fileTimeout || 2000)) {
                    emitEvent();
                } else {

                }

                lastInjected.time = new Date().getTime();
                lastInjected.file = filepath;
            }
        };
    },
    /**
     * Function to be called when watching begins
     * @param {Function} log
     * @param {Object} options
     * @returns {Function}
     */
    getWatchCallback: function (options, emitter) {

        return function (watcher) {
            var key = Object.keys(this.watched())[0];

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
     * @param {Function} changeFile
     * @param {Function} log
     * @param {Array} files
     * @param {socket} io
     * @param {Object} options
     */
    init: function (files, options, emitter) {

        var watchCallback = this.getWatchCallback(options, emitter);
        var changeCallback = this.getChangeCallback(options, emitter);

        var watcher = this.getWatcher(files);

        watcher.on("ready", watchCallback);
        watcher.on("changed", changeCallback);
    }
};