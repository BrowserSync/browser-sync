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
    }

    var globs = options.get("files");

    return globs.reduce(function (map, glob, namespace) {

        /**
         * Default CB when not given
         * @param event
         * @param path
         */
        var fn = function (event, path) {
            var data = {
                event: event,
                path: path,
                namespace: namespace
            };
            emitter.emit("file:changed", data);
        };

        /**
         * Handle lists
         */
        if (Immutable.List.isList(glob)) {
            var watcher = getWatcher(glob.toJS(), localfn);
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

                var watcher = getWatcher(key, localfn);

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

function getWatcher (patterns, fn) {
    require('chokidar').watch(patterns, {ignored: /[\/\\]\./}).on('all', fn);
}
