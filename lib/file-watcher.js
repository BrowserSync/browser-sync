"use strict";

var globWatcher = require("glob-watcher");
var _           = require("lodash");

/**
 * Plugin interface
 * @returns {*|function(this:exports)}
 */
module.exports.plugin = function (globs, options, emitter) {

    // Options to pass along to Gaze
    var watchOptions = options.watchOptions || options.watchoptions || {};
    var tempWatcher;
    var watchers = {};

    _.each(globs, function (glob, namespace) {

        tempWatcher = globWatcher(glob, watchOptions, function (data) {
            data.namespace = namespace;
            emitter.emit("file:changed", data);
        });

        // Ignore dir-related errors from gaze
        tempWatcher.on("error", function () {/*noop*/});

        watchers[namespace] = {
            glob: glob,
            watcher: tempWatcher
        };
    });

    return watchers;
};
