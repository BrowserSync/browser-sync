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
    var port         = bs.options.port;
    //var debug        = bs.debug;

    if (_.isString(options.tunnel)) {
        opts.subdomain = options.tunnel;
    }

    //debug("Trying tunnel connection with: %s ", options.tunnel || "no subdomain specified");

    tunnelRunner(port, opts, function (err, tunnel) {
        if (err) {
            throw err;
        }
        cb(tunnel.url, true);
    });

};
