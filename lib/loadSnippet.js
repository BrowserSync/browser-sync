"use strict";

var messages = require("./messages");
var write = require("./snippet").write;
var utils = require("./snippet").utils;

/**
 * @param hostIp
 * @param ports
 * @param options
 * @param [env]
 * @returns {Function}
 */
module.exports = function (hostIp, ports,  options, env) {

    return function (req, res, next) {

        if (utils.isExcluded(req.url, options.excludedFileTypes)) {
            return next();
        }

        var tags = messages.scriptTags(hostIp, ports, options, env);

        res.write = write(res, tags, true);

        next();
    };
};