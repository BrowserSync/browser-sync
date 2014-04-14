"use strict";

var fs = require("fs");
var Gaze = require("gaze").Gaze;

/**
 * Plugin interface
 * @returns {*|function(this:exports)}
 */
module.exports.plugin = function () {
    return function (files, options, emitter) {
        exports.init(files, options, emitter);
    };
};

/**
 * @param {Array} files
 * @param {Object} options
 * @param {EventEmitter} emitter
 */
module.exports.init = function (files, options, emitter) {

    if (!files.length) {
        return;
    }

    var watchCallback = exports.getWatchCallback(emitter);
    var changeCallback = exports.getChangeCallback(options, emitter);

    var watcher = exports.getWatcher(files);

    watcher.on("ready", watchCallback);
    watcher.on("changed", changeCallback);
};

/**
 * Function to be called when watching begins
 * @param {EventEmitter} emitter
 * @returns {Function}
 */
module.exports.getWatchCallback = function (emitter) {
    return function (watcher) {
        emitter.emit("file:watching", { watcher: watcher});
    };
};
/**
 * Get an instance of Gaze
 * @param {Array} files
 * @returns {Gaze}
 */
module.exports.getWatcher = function (files) {
    return new Gaze(files);
};

/**
 * Handle changed files
 * @param {Object} options
 * @param {EventEmitter} emitter
 * @returns {Function}
 */
module.exports.getChangeCallback = function (options, emitter) {

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
};