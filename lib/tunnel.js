"use strict";

var _ = require("lodash");
var localTunnel = require("localtunnel");

/**
 * @param {BrowserSync} bs
 * @param {Function} cb
 */
module.exports = function (bs, cb) {

    var opts         = {};
    var options      = bs.options;
    var port         = options.get("port");

    if (_.isString(options.get("tunnel"))) {
        opts.subdomain = options.get("tunnel");
    }

    localTunnel(port, opts, function (err, tunnel) {
        if (err) {
            cb(err);
        }
        cb(null, tunnel);
    });
};
