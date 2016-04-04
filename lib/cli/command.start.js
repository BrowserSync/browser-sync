"use strict";

var path  = require("path");
var fs    = require("fs");
var _     = require("lodash");
var utils = require("../utils");

/**
 * $ browser-sync start <options>
 *
 * This commands starts the Browsersync servers
 * & Optionally UI.
 *
 * @param opts
 * @returns {Function}
 */
module.exports = function (opts) {

    var flags    = stripUndefined(opts.cli.flags);
    var maybepkg = path.resolve(process.cwd(), "package.json");
    var input    = flags;

    if (flags.config) {
        var maybeconf = path.resolve(process.cwd(), flags.config);
        if (fs.existsSync(maybeconf)) {
            var conf = require(maybeconf);
            input = _.merge({}, conf, flags);
        } else {
            utils.fail(true, new Error("Configuration file '" + flags.config + "' not found"), opts.cb);
        }
    } else {
        if (fs.existsSync(maybepkg)) {
            var pkg = require(maybepkg);
            if (pkg["browser-sync"]) {
                console.log("> Configuration obtained from package.json");
                input = _.merge({}, pkg["browser-sync"], flags);
            }
        }
    }

    return require("../../")
        .create("cli")
        .init(input, opts.cb);
};

/**
 * Incoming undefined values are problematic as
 * they interfere with Immutable.Map.mergeDeep
 * @param subject
 * @returns {*}
 */
function stripUndefined (subject) {
    return Object.keys(subject).reduce(function (acc, key) {
        var value = subject[key];
        if (typeof value === "undefined") {
            return acc;
        }
        acc[key] = value;
        return acc;
    }, {});
}
