"use strict";

var localTunnel = require("localtunnel");
var utils       = require("./utils").utils;
var messages    = require("./messages");

/**
 * @param {BrowserSync} bs
 * @param {number} port
 * @param {Function} cb
 */
module.exports.init = function (bs, port, cb) {

    var opts    = {};
    var options = bs.options;
    var debug   = bs.debug;

    if ("string" === typeof options.tunnel) {
        opts.subdomain = options.tunnel;
    }

    debug("Trying tunnel connection with: %s ", options.tunnel || "no subdomain specified");

    localTunnel(port, opts, function(err, tunnel) {

        if (err) {

            debug("Failed to connect to tunnel");

            utils.fail(messages.tunnelFail(err), options, true);

        } else {

            debug("Connected to tunnel, url: %s", tunnel.url);

            options.urls.tunnel = tunnel.url;

            cb(tunnel.url, true);
        }
    });
};