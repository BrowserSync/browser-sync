"use strict";

var logger        = require("../logger").logger;
var info          = require("./cli-info");
var flags         = require("./opts.json");
var _             = require("lodash");
var flagKeys      = Object.keys(flags);
var flagWhitelist = flagKeys.map(dropPrefix).map(_.camelCase);

/**
 * $ browser-sync start <options>
 *
 * This commands starts the BrowserSync servers
 * & Optionally UI.
 *
 * @param opts
 * @returns {Function}
 */
module.exports = function (opts) {

    var flags = opts.cli.flags;

    if (!require("./cli-utils").verifyOpts(flagWhitelist, flags)) {
        logger.info("For help, run: {cyan:browser-sync --help}");
        return opts.cb(new Error("Unknown flag given. Please refer to the documentation for help."));
    }

    return require("../../")
        .create("cli")
        .init(flags.config ? info.getConfigFile(flags.config) : flags, opts.cb);
};

/**
 * @param {String} item
 * @returns {String}
 */
function dropPrefix (item) {
    return item.replace("no-", "");
}
