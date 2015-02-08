"use strict";

var _         = require("lodash");
var merge     = require("../cli/cli-options").merge;
var tfunk     = require("eazy-logger").compile;

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

        var args = require("../args")(_.toArray(arguments));

        args.config.version = pjson.version;

        return browserSync.init(merge(args.config), args.cb);
    };
};
