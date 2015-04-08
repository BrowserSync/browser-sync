"use strict";

var error = "Could not contact BrowserSync server.";

/**
 * $ browser-sync reload <options>
 *
 * This commands starts the BrowserSync servers
 * & Optionally UI.
 *
 * @param opts
 * @returns {Function}
 */
module.exports = function (opts) {

    var flags = opts.cli.flags;
    var proto = require("../http-protocol");

    var url   = proto.getUrl({method: "reload", args: flags.files}, "http://localhost:" + (flags.port || 3000));

    require("http").get(url, function (res) {
        if (res.statusCode !== 200) {
            require("logger").logger.error(error);
            return opts.cb(new Error(error));
        } else {
            opts.cb(null, res);
        }
    });
};
