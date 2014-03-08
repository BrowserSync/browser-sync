"use strict";

var fs   = require("fs");
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

            var chunks = [];

            fs.createReadStream(filepath)
                .on("data", push)
                .on("end", end);

            function push(chunk) {
                chunks.push(chunk);
            }

            function end() {
                if (chunks.join("").length > 0) {
                    setTimeout(function () {
                        emitter.emit("file:changed", {path: filepath});
                    }, options.reloadDelay || 0);
                }
            }
        };
    },
    /**
     * Function to be called when watching begins
     * @param {EventEmitter} emitter
     * @returns {Function}
     */
    getWatchCallback: function (emitter) {
        return function (watcher) {
            emitter.emit("file:watching", { watcher: watcher});
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

        if (!files.length) {
            return;
        }

        var watchCallback = this.getWatchCallback(emitter);
        var changeCallback = this.getChangeCallback(options, emitter);

        var watcher = this.getWatcher(files);

        watcher.on("ready", watchCallback);
        watcher.on("changed", changeCallback);
    },
    /**
     * Plugin interface
     * @returns {*|function(this:exports)}
     */
    plugin: function () {
        return function (files, options, emitter) {
            this.init(files, options, emitter);
        }.bind(this);
    }
};