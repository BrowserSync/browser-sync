"use strict";

var localTunnel = require("localtunnel");

/**
 * @param {BrowserSync.options} options
 * @param {number} port
 * @param {function} cb
 */
module.exports.init = function (options, port, cb) {

    var opts = {};

    if ("string" === typeof options.tunnel) {
        opts.subdomain = options.tunnel;
    }

    localTunnel(port, opts, function(err, tunnel) {
        if (err) {
            console.log("error from tunnel");
        }
        options.urls.tunnel = tunnel.url;
        cb(tunnel.url, true);
    });
};