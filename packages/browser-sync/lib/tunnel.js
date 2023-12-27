"use strict";

var _ = require("./lodash.custom");
var utils = require("util");

/**
 * @param {BrowserSync} bs
 * @param {Function} cb
 */
module.exports = function(bs, cb) {
    var localtunnel;
    try {
        localtunnel = require("localtunnel");
    } catch (e) {
        if (e.code === "MODULE_NOT_FOUND") {
            var error = new Error("Could not find package `localtunnel`. From Browsersync version 3.0 you'll need to install this manually.");
            error.code = e.code;
            return cb(error);
        }
        return cb(e);
    }
    var opts = {};
    var options = bs.options;
    var port = options.get("port");

    if (_.isString(options.get("tunnel"))) {
        opts.subdomain = options.get("tunnel");
    }

    bs.debug("Requesting a tunnel connection on port: {magenta:%s}", port);
    bs.debug(
        "Requesting a tunnel connection with options: {magenta:%s}",
        utils.inspect(opts)
    );

    localtunnel(port, opts, function(err, tunnel) {
        if (err) {
            return cb(err);
        }

        tunnel.on("error", function(err) {
            bs.logger.info("Localtunnel issue: " + err.message);
            bs.logger.info(
                "Oops! The localtunnel appears to have disconnected. Reconnecting..."
            );
        });

        return cb(null, tunnel);
    });
};
