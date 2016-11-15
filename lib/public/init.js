"use strict";

var _         = require("../../lodash.custom");
var merge     = require("../cli/cli-options").merge;

/**
 * @param {BrowserSync} browserSync
 * @param {String} [name] - instance name
 * @param {Object} pjson
 * @returns {Function}
 */
module.exports = function (browserSync, name, pjson) {

    return function () {

        /**
         * Handle new + old signatures for init.
         */
        var args = require("../args")(_.toArray(arguments));

        /**
         * If the current instance is already running, just return an error
         */
        if (browserSync.active) {
            return args.cb(new Error("Instance: " + name + " is already running!"));
        }

        args.config.version = pjson.version;

        /**
         * Preserve the httpModule property's functions.
         * the http2 module exports an object of functions and the merge function seems
         * to want to destroy that, but if the base object is a function it seems fine
         * TODO: find a better or more generic way to handle this
         */
        if(args.config.httpModule && !_.isFunction(args.config.httpModule)) {
            args.config.httpModule = Object.assign(function() {}, args.config.httpModule);
        }

        return browserSync.init(merge(args.config), args.cb);
    };
};
