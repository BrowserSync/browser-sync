"use strict";

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

        var jsItem = glob.toJS();

        if (jsItem.globs.length) {
            if (!map[namespace]) {
                map[namespace] = {
                    watchers: [getWatcher(jsItem.globs, watchOptions, fn)]
                };
            } else {
                map[namespace].watchers.push(getWatcher(jsItem.globs, watchOptions, fn));
            }
        }

        if (jsItem.objs.length) {
            jsItem.objs.forEach(function (item) {
                if (!map[namespace]) {
                    map[namespace] = {
                        watchers: [getWatcher(item.match, watchOptions, item.fn)]
                    };
                } else {
                    map[namespace].watchers.push(getWatcher(item.match, watchOptions, item.fn));
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
