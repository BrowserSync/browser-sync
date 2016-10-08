"use strict";

var _ = require("../lodash.custom");
var utils = require("./utils");
var Rx = require("rx");

/**
 * Plugin interface
 * @returns {*|function(this:exports)}
 */
module.exports.plugin = function (bs) {

    var options = bs.options;
    var emitter = bs.emitter;
    var subject = new Rx.Subject();
    var sub$    = getObservable(subject, bs.options);

    var subscription = sub$.subscribe(function (value) {
        emitter.emit("file:changed", value);
    });

    bs.registerCleanupTask(function () {
        subscription.dispose();
        subject.dispose();
    });

    var defaultWatchOptions = options.get("watchOptions").toJS();

    return options.get("files").reduce(function (map, glob, namespace) {

        /**
         * Default CB when not given
         * @param event
         * @param path
         */
        var fn = function (event, path) {
            subject.onNext({
                event: event,
                path: path,
                namespace: namespace
            });
        };

        var jsItem = glob.toJS();

        if (jsItem.globs.length) {
            var watcher = watch(jsItem.globs, defaultWatchOptions, fn);
            map[namespace] = {
                watchers: [watcher]
            };
        }

        if (jsItem.objs.length) {
            jsItem.objs.forEach(function (item) {
                if (!_.isFunction(item.fn)) {
                    item.fn = fn;
                }
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

/**
 * Apply debounce, throttle or delay operators
 * to the default stream of events
 * @param subject
 * @param options
 * @returns {*|Observable.<T>}
 */
function getObservable(subject, options) {

    var globalItems = [
        {
            option: "reloadDebounce",
            fnName: "debounce"
        },
        {
            option: "reloadThrottle",
            fnName: "throttle"
        },
        {
            option: "reloadDelay",
            fnName: "delay"
        }
    ];

    var scheduler = options.getIn(["debug", "scheduler"]);

    return globalItems.reduce(function(subject, item) {
        var value = options.get(item.option);
        if (value > 0) {
            return subject[item.fnName].call(subject, value, scheduler);
        }
        return subject;
    }, subject);
}
