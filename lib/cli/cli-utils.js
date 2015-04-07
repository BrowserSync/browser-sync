"use strict";

var utils    = exports;
var logger   = require("../logger").logger;
var flags    = require("./opts.json");
var flagKeys = Object.keys(flags);
var _        = require("lodash");

utils.verifyOpts = function (flagWhitelist, cliFlags) {

    return Object.keys(cliFlags).every(function (key) {

        if (_.contains(flagWhitelist, key) || _.contains(flagKeys, key)) {
            return true;
        }

        logger.info("Unknown flag:  {yellow:`%s`", key);

        return false;
    });
};
