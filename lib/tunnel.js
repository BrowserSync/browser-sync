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

    if (_.isArray(options.tunnel)) {
        var urls = [];
        options.tunnel.forEach(function (subdomain) {
            var opts = {
             subdomain: subdomain
            };

            tunnelRunner(port, opts, function (err, tunnel) {
                if (err) {
                    throw err;
                }
                urls.push(tunnel.url);
                if (urls.length === options.tunnel.length) {
                    cb(urls.join("\n"), true);
                }
            });

        });
    } else {
        if (_.isString(options.tunnel)) { opts.subdomain = options.tunnel; }

        tunnelRunner(port, opts, function (err, tunnel) {
            if (err) {
                throw err;
            }
            cb(tunnel.url, true);
        });
    }

    //debug("Trying tunnel connection with: %s ", options.tunnel || "no subdomain specified");

};
