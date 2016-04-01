"use strict";

var info = require("./cli-info");

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

    var flags = stripUndefined(opts.cli.flags);

    return require("../../")
        .create("cli")
        .init(flags, opts.cb);
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
        if (typeof value === 'undefined') {
            return acc;
        }
        acc[key] = value;
        return acc;
    }, {});
}
