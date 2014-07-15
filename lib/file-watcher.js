"use strict";

var fs          = require("fs");
var globWatcher = require("glob-watcher");
var _           = require("lodash");

/**
 * Plugin interface
 * @returns {*|function(this:exports)}
 */
module.exports.plugin = function (globs, options, emitter) {

    // Options to pass along to Gaze
    var watchOptions = options.watchOptions || options.watchoptions || {};

    var watchers = {};

    _.each(globs, function (glob, namespace) {

        watchers[namespace] = {
            glob: glob,
            watcher: globWatcher(glob, watchOptions, function (data) {
                data.namespace = namespace;
                emitter.emit("file:changed", data);
            })
        };
    });

    return watchers;
};