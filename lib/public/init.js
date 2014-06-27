"use strict";

var defaultConfig = require("../default-config");
var cliOptions    = require("../cli/cli-options");

var merge         = require("opt-merger").merge;
var _             = require("lodash");

/**
 * @param {Function} cb
 * @returns {Function}
 */
module.exports = function (cb) {

    return function () {

        var args   = require("../args")(arguments);

        var config = merge(_.cloneDeep(defaultConfig), args.config || {}, cliOptions.callbacks);

        if (!config.server && !config.proxy) {
            config.open = false;
        }

        return cb(config.files, config, args.cb);
    };
};