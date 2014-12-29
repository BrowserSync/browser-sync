"use strict";

var Immutable = require("immutable");
var merge = require("../cli/cli-options").merge;
var tfunk = require("eazy-logger").compile;

/**
 * @param {BrowserSync} browserSync
 * @param {String} [name]
 * @param {Object} pjson
 * @returns {Function}
 */
module.exports = function (browserSync, name, pjson) {

    return function () {

        if (browserSync.active) {
            return console.log(tfunk("Instance: {yellow:%s} is already running!"), name);
        }

        var args = require("../args")(Array.prototype.slice.call(arguments));

        var config = merge(args.config)
            .withMutations(function (item) {
                if (!item.get("server") && !item.get("proxy")) {
                    item.set("open", false);
                }
                item.set("version", pjson.version);
                if (item.get("files") === false) {
                    item.set("files", Immutable.List([]));
                }
            });

        return browserSync.init(config, args.cb);
    };
};
