"use strict";

var globWatcher = require("glob-watcher");

/**
 * Plugin interface
 * @returns {*|function(this:exports)}
 */
module.exports.plugin = function (options, emitter) {

    // Options to pass along to Gaze
    var watchOptions = options.get("watchOptions") || options.get("watchoptions");

    if (watchOptions) {
        watchOptions = watchOptions.toJS();
    }

    var globs = options.get("files");

    return globs.reduce(function (map, glob, namespace) {

        if (!glob.size) {
            return map;
        }

        var tempWatcher;

        tempWatcher = globWatcher(glob.toJS(), watchOptions, function (data) {
            data.namespace = namespace;
            emitter.emit("file:changed", data);
        });

        // Ignore dir-related errors from gaze
        tempWatcher.on("error", function () {/*noop*/});

        map[namespace] = {
            glob: glob,
            watcher: tempWatcher
        };

        return map;
    }, {});
};
