"use strict";

var _ = require("lodash");

/**
 * @param {BrowserSync} bs
 * @param {Function} tunnelRunner
 * @param {Function} cb
 */
module.exports.plugin = function (bs, tunnelRunner, cb) {

    var opts         = {};
    var options      = bs.options;
    var port         = options.get("port");

    if (_.isString(options.get("tunnel"))) {
        opts.subdomain = options.get("tunnel");
    }

    tunnelRunner(port, opts, function (err, tunnel) {
        if (err) {
            throw err;
        }
        cb(tunnel.url, true);
    });

};
