var utils = require("./utils");

module.exports = function (subject, options) {
    var globalItems = [
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

    var initial = (function() {
        if (options.get("reloadDebounce") > 0) {
            return getDebouncedStream(subject, options, scheduler);
        }
        return subject;
    })();

    var withOps = applyOperators(globalItems, initial, options, scheduler);

    return withOps
        .map(function(xs) {

            var items = [].concat(xs);
            var paths = items.map(function (x) { return x.path });

            if (utils.willCauseReload(paths, options.get("injectFileTypes").toJS())) {
                return {
                    type: "reload",
                    files: items
                }
            }
            return {
                type: "inject",
                files: items
            }
        });
};

function applyReloadOperators (subject, options) {
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

    return applyOperators(globalItems, subject, options, scheduler);
}
module.exports.applyReloadOperators = applyReloadOperators;

function applyOperators (items, subject, options, scheduler) {
    return items.reduce(function(subject, item) {
        var value = options.get(item.option);
        if (value > 0) {
            return subject[item.fnName].call(subject, value, scheduler);
        }
        return subject;
    }, subject);
}

function getDebouncedStream (subject, options, scheduler) {
    return subject
        .filter(function(x) { return options.get("watchEvents").indexOf(x.event) > -1 })
        .buffer(subject.debounce(options.get("reloadDebounce"), scheduler))
        .map(function(buffered) {
            return buffered.reduce(function (acc, item) {
                if (!acc[item.path]) acc[item.path] = item;
                if (acc[item.path]) acc[item.path] = item;
                return acc;
            }, {});
        })
        .map(function(group) {
            return Object
                .keys(group)
                .map(function(key) {
                    return group[key];
                });
        })
        .filter(function (x) { return x.length })
}
