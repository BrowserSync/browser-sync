"use strict";

/**
 * Plugin interface
 * @returns {*|function(this:exports)}
 */
module.exports.plugin = function (options, emitter) {

    var defaultWatchOptions = require("immutable").Map({
        ignored:  /[\/\\]\./
    })
    .mergeDeep(
        options.get("watchOptions") || options.get("watchoptions")
    )
    .toJS();

    return options.get("files").reduce(function (map, glob, namespace) {

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

        var jsItem = glob.toJS();

        if (jsItem.globs.length) {
            map[namespace] = {
                watchers: [getWatcher(jsItem.globs, defaultWatchOptions, fn)]
            };
        }

        if (jsItem.objs.length) {
            jsItem.objs.forEach(function (item) {
                if (!map[namespace]) {
                    map[namespace] = {
                        watchers: [getWatcher(item.match, item.options || defaultWatchOptions, item.fn)]
                    };
                } else {
                    map[namespace].watchers.push(getWatcher(item.match, item.options || defaultWatchOptions, item.fn));
                }
            });
        }

        return map;

    }, {});
};

function getWatcher (patterns, opts, fn) {
    return require("chokidar").watch(patterns, opts).on("all", fn);
}
