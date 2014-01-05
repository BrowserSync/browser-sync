"use strict";

var messages = require("./messages");
var write = require("./snippet").write;
var utils = require("./snippet").utils;

/**
 * @param hostIp
 * @param ports
 * @param options
 * @returns {Function}
 */
module.exports = function (hostIp, ports,  options) {

    return function (req, res, next) {

        if (utils.isExcluded(req)) {
            return next();
        }

        var tags = messages.scriptTags(hostIp, ports, options);

        res.write = write(res, tags, true);

        next();
    };
};