"use strict";

var localTunnel = require("localtunnel");
var _           = require("lodash");

/**
 * @param {BrowserSync} bs
 * @param {number} port
 * @param {Function} cb
 */
module.exports.plugin = function (bs, port, cb) {

    var opts = {};
    var options = bs.options;

    if (_.isString(options.tunnel)) {
        opts.subdomain = options.tunnel;
    }

//    debug("Trying tunnel connection with: %s ", options.tunnel || "no subdomain specified");

    localTunnel(port, opts, function (err, tunnel) {
        options.urls.tunnel = tunnel.url;
        cb(tunnel.url, true);
    });
};
