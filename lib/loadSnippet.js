"use strict";

var messages = require("./messages");
var write = require("./snippet").write;
var utils = require("./snippet").utils;

module.exports = function (hostIp, socketIoPort, scriptPort, options) {

    return function (req, res, next) {

        if (utils.isExcluded(req)) {
            return next();
        }

        var tags = messages.scriptTags(hostIp, socketIoPort, scriptPort, options);

        res.write = write(res, tags, true);

        next();
    };
};