"use strict";

var Immutable = require("immutable");
var isFunction = require("lodash/lang/isFunction");
/**
 * Plugin interface
 * @returns {*|function(this:exports)}
 */
module.exports.plugin = function (options, emitter) {

    // Options to pass along to Gaze
    var watchOptions = options.get("watchOptions") || options.get("watchoptions");

    if (watchOptions) {
        watchOptions = watchOptions.toJS();
    } else {
        watchOptions = {};
    }

    var globs = options.get("files");

    return globs.reduce(function (map, glob, namespace) {

        /**
         * Default CB when not given
         * @param event
         * @param path
         */
        var fn = function (event, path) {
            emitter.emit("file:changed", {
                event: event,
                path: path,
                namespace: namespace
            });
        };

        /**
         * Handle lists
         */
        if (Immutable.List.isList(glob)) {
            var watcher = getWatcher(glob.toJS(), watchOptions, fn);
            if (!map[namespace]) {
                map[namespace] = [watcher];
            } else {
                map[namespace].push(watcher);
            }
        }

        /**
         * Handle maps
         */
        if (Immutable.Map.isMap(glob)) {

            glob.forEach(function (value, key) {

                var localfn = fn;

                if (isFunction(value)) {
                    localfn = value;
                }

                var watcher = getWatcher(key, watchOptions, localfn);

                if (!map[namespace]) {
                    map[namespace] = [watcher];
                } else {
                    map[namespace].push(watcher);
                }

            });
        }

        return map;

    }, {});
};

function getWatcher (patterns, opts, fn) {

    if (!opts.ignored) {
        opts.ignored = /[\/\\]\./;
    }

    return require("chokidar").watch(patterns, opts).on("all", fn);
}
