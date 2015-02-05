"use strict";

var ngrok       = require("ngrok");
var utils       = require("util");

/**
 * @param {BrowserSync} bs
 * @param {Function} cb
 */
module.exports = function (bs, cb) {

    var options      = bs.options;
    var port         = options.get("port");
    var opts         = options.get("tunnel");

    bs.debug("Requesting a tunnel connection on port: {magenta:%s}", port);
    bs.debug("Requesting a tunnel connection with options: {magenta:%s}", utils.inspect(opts));

    ngrok.connect(opts.set("port", port).toJS(), function (err, url) {
        if (err) {
            return cb(err);
        }
        return cb(null, url);
    });
    return ngrok;
};
