"use strict";

var fs = require("fs");
var messages = require("./messages");
var Gaze = require("gaze").Gaze;


module.exports = {
    /**
     * Handle changed files
     * @param {Function} callback
     * @param {socket} io
     * @param {Object} options
     * @param {Object} _this
     * @returns {Function}
     */
    getChangeCallback: function (callback, io, options, _this) {

        var lastInjected = {
            time: new Date().getTime()
        };

        return function (filepath) {

            var stats = fs.statSync(filepath);

            var doCallback = function () {
                callback(filepath, io, options, _this);
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

                        doCallback();
                        clearInterval(writeCheck);
                    }
                }, 200);
            } else {

                if (new Date().getTime() > lastInjected.time + (options.fileTimeout || 2000)) {
                    doCallback();
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
    getWatchCallback: function (log, options) {

        return function (watcher) {
            var key = Object.keys(this.watched())[0];

            if (key) {
                log(messages.files.watching(watcher._patterns), options, true);
            } else {
                log(messages.files.watching(), options, true);
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
     * @param {Object} _this
     */
    init: function (changeFile, log, files, io, options, _this) {

        var watchCallback = this.getWatchCallback(log, options);
        var changeCallback = this.getChangeCallback(changeFile, io, options, _this);

        var watcher = this.getWatcher(files);

        watcher.on("ready", watchCallback);
        watcher.on("changed", changeCallback);
    }
};