"use strict";

var _ = require("lodash");

/**
 * Plugin interface
 * @returns {*|function(this:exports)}
 */
module.exports.plugin = function (bs) {

    var options = bs.options;
    var emitter = bs.emitter;

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
                watchers: [watch(jsItem.globs, defaultWatchOptions, fn)]
            };
        }

        if (jsItem.objs.length) {
            jsItem.objs.forEach(function (item) {
                var watcher = watch(item.match, item.options || defaultWatchOptions, item.fn.bind(bs.publicInstance));
                if (!map[namespace]) {
                    map[namespace] = {
                        watchers: [watcher]
                    };
                } else {
                    map[namespace].watchers.push(watcher);
                }
            });
        }

        return map;

    }, {});
};

/**
 * @param patterns
 * @param opts
 * @param cb
 * @returns {*}
 */
function watch (patterns, opts, cb) {

    if (typeof opts === "function") {
        cb = opts;
        opts = {};
    }

    var watcher = require("chokidar")
        .watch(patterns, opts);

    if (_.isFunction(cb)) {
        watcher.on("all", cb);
    }

    return watcher;
}

module.exports.watch = watch;
